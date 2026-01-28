"""Neo4j graph database service for entity relationship analysis."""
import json
import logging
from typing import List, Dict, Optional, Any
from neo4j import GraphDatabase, Driver
from app.config import settings

logger = logging.getLogger(__name__)

# Global Neo4j driver instance
_graph_driver: Optional[Driver] = None


def get_graph_driver() -> Optional[Driver]:
    """Get or create Neo4j driver instance."""
    global _graph_driver
    
    if not settings.neo4j_enabled:
        return None
    
    if not all([settings.neo4j_uri, settings.neo4j_user, settings.neo4j_password]):
        logger.warning("Neo4j credentials not provided. Graph features disabled.")
        return None
    
    if _graph_driver is None:
        try:
            _graph_driver = GraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_user, settings.neo4j_password)
            )
            # Test connection
            with _graph_driver.session() as session:
                session.run("RETURN 1")
            logger.info("Neo4j connection established")
        except Exception as e:
            logger.warning(f"Neo4j connection failed: {e}. Graph features disabled.")
            _graph_driver = None
    
    return _graph_driver


def _serialize_metadata(value: Optional[Any]) -> Any:
    """Convert metadata to Neo4j-safe property values."""
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        try:
            return json.dumps(value)
        except (TypeError, ValueError):
            return str(value)
    return value


class GraphService:
    """Service for Neo4j graph operations."""
    
    def __init__(self):
        self.driver = get_graph_driver()
    
    def _execute_query(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict]:
        """Execute a Cypher query and return results."""
        if not self.driver:
            return []
        
        try:
            with self.driver.session() as session:
                result = session.run(query, parameters or {})
                return [record.data() for record in result]
        except Exception as e:
            logger.error(f"Neo4j query error: {e}")
            return []
    
    def sync_entity(self, entity_id: str, entity_type: str, name: Optional[str] = None, metadata: Optional[Dict] = None):
        """Create or update an entity node in Neo4j."""
        if not self.driver:
            return
        
        query = """
        MERGE (e:Entity {entity_id: $entity_id})
        SET e.entity_type = $entity_type,
            e.name = $name,
            e.metadata = $metadata,
            e.updated_at = datetime()
        RETURN e
        """
        
        self._execute_query(query, {
            "entity_id": entity_id,
            "entity_type": entity_type,
            "name": name or "",
            "metadata": _serialize_metadata(metadata)
        })
    
    def sync_entity_link(
        self,
        from_entity_id: str,
        to_entity_id: str,
        relationship_type: str,
        metadata: Optional[Dict] = None
    ):
        """Create or update a relationship between entities."""
        if not self.driver:
            return
        
        # Ensure both entities exist
        self.sync_entity(from_entity_id, "", "")
        self.sync_entity(to_entity_id, "", "")
        
        # Create relationship
        query = """
        MATCH (from:Entity {entity_id: $from_id})
        MATCH (to:Entity {entity_id: $to_id})
        MERGE (from)-[r:RELATES_TO {type: $rel_type}]->(to)
        SET r.metadata = $metadata,
            r.created_at = coalesce(r.created_at, datetime())
        RETURN r
        """
        
        self._execute_query(query, {
            "from_id": from_entity_id,
            "to_id": to_entity_id,
            "rel_type": relationship_type,
            "metadata": _serialize_metadata(metadata)
        })
    
    def get_entity_network(self, entity_id: str, max_depth: int = 2) -> Dict:
        """Get entity network graph up to max_depth hops."""
        if not self.driver:
            return {"entity": None, "links": []}
        
        # Get entity
        entity_query = """
        MATCH (e:Entity {entity_id: $entity_id})
        RETURN e
        """
        entity_result = self._execute_query(entity_query, {"entity_id": entity_id})
        
        if not entity_result:
            return {"entity": None, "links": []}
        
        # Get network with variable depth
        network_query = f"""
        MATCH path = (start:Entity {{entity_id: $entity_id}})-[:RELATES_TO*1..{max_depth}]->(connected:Entity)
        WITH connected, relationships(path) as rels
        RETURN DISTINCT connected.entity_id as entity_id,
               connected.entity_type as entity_type,
               connected.name as name,
               rels[0].type as relationship_type,
               rels[0].metadata as metadata
        LIMIT 100
        """
        
        links = self._execute_query(network_query, {"entity_id": entity_id})
        
        return {
            "entity": entity_result[0].get("e", {}),
            "links": links
        }
    
    def find_fraud_rings(self, min_entities: int = 3, min_connections: int = 2) -> List[Dict]:
        """Find potential fraud rings (clusters of highly connected entities)."""
        if not self.driver:
            return []
        
        query = """
        MATCH (e1:Entity)-[:RELATES_TO]->(e2:Entity)-[:RELATES_TO]->(e3:Entity)
        WHERE e1 <> e3
        WITH e1, e2, e3, count(*) as connections
        WHERE connections >= $min_connections
        RETURN e1.entity_id as entity1,
               e2.entity_id as entity2,
               e3.entity_id as entity3,
               connections
        ORDER BY connections DESC
        LIMIT 50
        """
        
        return self._execute_query(query, {
            "min_connections": min_connections
        })
    
    def find_related_entities(self, entity_id: str, relationship_types: Optional[List[str]] = None) -> List[Dict]:
        """Find entities related to a given entity by specific relationship types."""
        if not self.driver:
            return []
        
        if relationship_types:
            rel_filter = f"WHERE r.type IN {relationship_types}"
        else:
            rel_filter = ""
        
        query = f"""
        MATCH (e:Entity {{entity_id: $entity_id}})-[r:RELATES_TO]->(related:Entity)
        {rel_filter}
        RETURN related.entity_id as entity_id,
               related.entity_type as entity_type,
               related.name as name,
               r.type as relationship_type,
               r.metadata as metadata
        """
        
        return self._execute_query(query, {"entity_id": entity_id})
    
    def delete_entity(self, entity_id: str):
        """Delete an entity and all its relationships."""
        if not self.driver:
            return
        
        query = """
        MATCH (e:Entity {entity_id: $entity_id})
        DETACH DELETE e
        """
        
        self._execute_query(query, {"entity_id": entity_id})
    
    def clear_all(self):
        """Clear all data from Neo4j (use with caution!)."""
        if not self.driver:
            return
        
        query = "MATCH (n) DETACH DELETE n"
        self._execute_query(query)


# Global graph service instance
_graph_service: Optional[GraphService] = None


def get_graph_service() -> Optional[GraphService]:
    """Get or create graph service instance."""
    global _graph_service
    
    if not settings.neo4j_enabled:
        return None
    
    if _graph_service is None:
        _graph_service = GraphService()
    
    return _graph_service

