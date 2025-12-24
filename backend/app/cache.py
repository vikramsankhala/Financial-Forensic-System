"""Redis cache service for performance optimization."""
import json
import logging
from typing import Optional, Any, Dict
from functools import wraps
import redis
from app.config import settings

logger = logging.getLogger(__name__)

# Global Redis client instance
_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> Optional[redis.Redis]:
    """Get or create Redis client instance."""
    global _redis_client
    
    if not settings.redis_enabled or not settings.redis_url:
        return None
    
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # Test connection
            _redis_client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.warning(f"Redis connection failed: {e}. Cache disabled.")
            _redis_client = None
    
    return _redis_client


def cache_key(prefix: str, *args, **kwargs) -> str:
    """Generate cache key from prefix and arguments."""
    key_parts = [prefix]
    if args:
        key_parts.extend(str(arg) for arg in args)
    if kwargs:
        sorted_kwargs = sorted(kwargs.items())
        key_parts.extend(f"{k}:{v}" for k, v in sorted_kwargs)
    return ":".join(key_parts)


def get_cache(key: str) -> Optional[Any]:
    """Get value from cache."""
    client = get_redis_client()
    if not client:
        return None
    
    try:
        value = client.get(key)
        if value:
            return json.loads(value)
    except Exception as e:
        logger.warning(f"Cache get error for key {key}: {e}")
    
    return None


def set_cache(key: str, value: Any, ttl: Optional[int] = None) -> bool:
    """Set value in cache with optional TTL."""
    client = get_redis_client()
    if not client:
        return False
    
    try:
        ttl = ttl or settings.redis_cache_ttl
        serialized = json.dumps(value, default=str)
        client.setex(key, ttl, serialized)
        return True
    except Exception as e:
        logger.warning(f"Cache set error for key {key}: {e}")
    
    return False


def delete_cache(key: str) -> bool:
    """Delete key from cache."""
    client = get_redis_client()
    if not client:
        return False
    
    try:
        client.delete(key)
        return True
    except Exception as e:
        logger.warning(f"Cache delete error for key {key}: {e}")
    
    return False


def delete_cache_pattern(pattern: str) -> int:
    """Delete all keys matching pattern."""
    client = get_redis_client()
    if not client:
        return 0
    
    try:
        keys = client.keys(pattern)
        if keys:
            return client.delete(*keys)
        return 0
    except Exception as e:
        logger.warning(f"Cache delete pattern error for {pattern}: {e}")
    
    return 0


def cached(ttl: Optional[int] = None, key_prefix: Optional[str] = None):
    """Decorator to cache function results."""
    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Generate cache key
            prefix = key_prefix or f"{func.__module__}.{func.__name__}"
            cache_key_str = cache_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_value = get_cache(cache_key_str)
            if cached_value is not None:
                return cached_value
            
            # Call function and cache result
            result = await func(*args, **kwargs)
            set_cache(cache_key_str, result, ttl)
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Generate cache key
            prefix = key_prefix or f"{func.__module__}.{func.__name__}"
            cache_key_str = cache_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_value = get_cache(cache_key_str)
            if cached_value is not None:
                return cached_value
            
            # Call function and cache result
            result = func(*args, **kwargs)
            set_cache(cache_key_str, result, ttl)
            return result
        
        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator


# Cache key prefixes
class CacheKeys:
    """Standard cache key prefixes."""
    ENTITY = "entity"
    ENTITY_NETWORK = "entity:network"
    METRICS_DASHBOARD = "metrics:dashboard"
    METRICS_RISK_DIST = "metrics:risk_distribution"
    METRICS_TRANSACTIONS_TIME = "metrics:transactions_time"
    TRANSACTION = "transaction"
    CASE = "case"
    CASE_REPORT = "case:report"

