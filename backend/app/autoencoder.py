"""PyTorch autoencoder for anomaly detection."""
import torch
import torch.nn as nn
import numpy as np
from typing import Tuple, Optional
import os


class Autoencoder(nn.Module):
    """Simple autoencoder for anomaly detection."""
    
    def __init__(self, input_dim: int, latent_dim: Optional[int] = None, 
                 hidden_dims: Optional[list] = None):
        """Initialize autoencoder.
        
        Args:
            input_dim: Input feature dimension
            latent_dim: Latent space dimension (default: input_dim // 3)
            hidden_dims: List of hidden layer dimensions (default: [input_dim, input_dim * 2 // 3])
        """
        super(Autoencoder, self).__init__()
        
        if latent_dim is None:
            latent_dim = max(input_dim // 3, 8)
        
        if hidden_dims is None:
            hidden_dims = [input_dim, max(input_dim * 2 // 3, 16)]
        
        # Encoder
        encoder_layers = []
        prev_dim = input_dim
        for hidden_dim in hidden_dims:
            encoder_layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.ReLU(),
                nn.Dropout(0.1)
            ])
            prev_dim = hidden_dim
        
        encoder_layers.append(nn.Linear(prev_dim, latent_dim))
        self.encoder = nn.Sequential(*encoder_layers)
        
        # Decoder
        decoder_layers = []
        prev_dim = latent_dim
        for hidden_dim in reversed(hidden_dims):
            decoder_layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.ReLU(),
                nn.Dropout(0.1)
            ])
            prev_dim = hidden_dim
        
        decoder_layers.append(nn.Linear(prev_dim, input_dim))
        self.decoder = nn.Sequential(*decoder_layers)
    
    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """Forward pass.
        
        Args:
            x: Input tensor (batch_size, input_dim)
        
        Returns:
            Tuple of (encoded, decoded) tensors
        """
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return encoded, decoded
    
    def compute_reconstruction_error(self, x: torch.Tensor) -> torch.Tensor:
        """Compute MSE reconstruction error.
        
        Args:
            x: Input tensor
        
        Returns:
            Reconstruction error per sample
        """
        _, decoded = self.forward(x)
        error = torch.mean((x - decoded) ** 2, dim=1)
        return error
    
    def predict_anomaly_score(self, x: np.ndarray) -> Tuple[float, float]:
        """Predict anomaly score for input.
        
        Args:
            x: Input feature vector (numpy array)
        
        Returns:
            Tuple of (anomaly_score, reconstruction_error)
        """
        self.eval()
        with torch.no_grad():
            x_tensor = torch.FloatTensor(x).unsqueeze(0)
            _, decoded = self.forward(x_tensor)
            error = torch.mean((x_tensor - decoded) ** 2).item()
            # Normalize error to [0, 1] range (simple normalization)
            # In production, use percentile-based normalization
            score = min(error * 10, 1.0)  # Simple scaling
            return float(score), float(error)
    
    def save(self, path: str):
        """Save model to file.
        
        Args:
            path: Path to save model
        """
        os.makedirs(os.path.dirname(path), exist_ok=True)
        torch.save({
            "model_state_dict": self.state_dict(),
            "input_dim": self.encoder[0].in_features,
            "latent_dim": self.encoder[-1].out_features,
        }, path)
    
    @classmethod
    def load(cls, path: str, device: str = "cpu") -> "Autoencoder":
        """Load model from file.
        
        Args:
            path: Path to model file
            device: Device to load model on
        
        Returns:
            Loaded Autoencoder instance
        """
        checkpoint = torch.load(path, map_location=device)
        model = cls(
            input_dim=checkpoint["input_dim"],
            latent_dim=checkpoint["latent_dim"]
        )
        model.load_state_dict(checkpoint["model_state_dict"])
        model.eval()
        return model


def train_autoencoder(model: Autoencoder, train_data: np.ndarray,
                     epochs: int = 50, batch_size: int = 32,
                     learning_rate: float = 0.001, device: str = "cpu") -> list:
    """Train autoencoder model.
    
    Args:
        model: Autoencoder model
        train_data: Training data (n_samples, n_features)
        epochs: Number of training epochs
        batch_size: Batch size
        learning_rate: Learning rate
        device: Device to train on
    
    Returns:
        List of training losses per epoch
    """
    model.train()
    model = model.to(device)
    
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    criterion = nn.MSELoss()
    
    train_tensor = torch.FloatTensor(train_data).to(device)
    losses = []
    
    for epoch in range(epochs):
        epoch_loss = 0.0
        n_batches = 0
        
        # Simple batch training
        indices = torch.randperm(len(train_tensor))
        for i in range(0, len(train_tensor), batch_size):
            batch_indices = indices[i:i + batch_size]
            batch = train_tensor[batch_indices]
            
            optimizer.zero_grad()
            _, decoded = model(batch)
            loss = criterion(decoded, batch)
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            n_batches += 1
        
        avg_loss = epoch_loss / n_batches if n_batches > 0 else 0.0
        losses.append(avg_loss)
        
        if (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch + 1}/{epochs}, Loss: {avg_loss:.6f}")
    
    return losses

