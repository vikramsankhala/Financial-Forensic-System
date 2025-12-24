# Contributing Guidelines

This is a demonstration project for a production-grade fraud detection system. If you're extending or modifying this codebase, please follow these guidelines.

## Development Setup

1. Follow the setup instructions in `README.md`
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `pytest` (backend) and `npm test` (frontend)
5. Ensure code passes linting
6. Update documentation as needed

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints
- Document functions with docstrings
- Maximum line length: 100 characters

### TypeScript/React (Frontend)
- Use TypeScript strict mode
- Follow ESLint rules
- Use functional components with hooks
- Prefer named exports

## Testing

- Write unit tests for new features
- Maintain or improve test coverage
- Test edge cases and error conditions

## Security

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Follow security best practices

## Documentation

- Update README.md for user-facing changes
- Update architecture.md for structural changes
- Add comments for complex logic
- Document API changes

## Pull Request Process

1. Ensure all tests pass
2. Update documentation
3. Request review from maintainers
4. Address feedback
5. Merge after approval

## Questions?

For questions or clarifications, please open an issue.

