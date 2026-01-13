"""
Serviço de Geocodificação usando BrasilAPI V2 + Nominatim (fallback)
"""
import httpx
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class GeocodingService:
    """Serviço para geocodificação de CEPs usando BrasilAPI + Nominatim"""
    
    BRASILAPI_URL = "https://brasilapi.com.br/api/cep/v2"
    NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
    
    @staticmethod
    async def _geocode_with_nominatim(endereco: str, city: str, state: str) -> Optional[Tuple[float, float]]:
        """
        Usa Nominatim do OpenStreetMap para geocodificar um endereço.
        """
        try:
            query = f"{endereco}, {city}, {state}, Brazil"
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    GeocodingService.NOMINATIM_URL,
                    params={
                        "q": query,
                        "format": "json",
                        "limit": 1,
                        "countrycodes": "br"
                    },
                    headers={"User-Agent": "ConectaSaude/1.0"}
                )
                
                if response.status_code == 200:
                    results = response.json()
                    if results and len(results) > 0:
                        lat = float(results[0]["lat"])
                        lon = float(results[0]["lon"])
                        logger.info(f"Geocodificação Nominatim bem-sucedida: ({lat}, {lon})")
                        return (lat, lon)
        except Exception as e:
            logger.error(f"Erro ao geocodificar com Nominatim: {str(e)}")
        
        return None
    
    @staticmethod
    async def get_coordinates_from_cep(cep: str) -> Optional[Tuple[float, float, str]]:
        """
        Busca as coordenadas (latitude, longitude) e endereço completo a partir de um CEP.
        
        Args:
            cep: CEP no formato "12345-678" ou "12345678"
        
        Returns:
            Tupla (latitude, longitude, endereco_completo) ou None se falhar
        """
        # Remove caracteres não numéricos do CEP
        cep_limpo = cep.replace("-", "").replace(".", "").strip()
        
        if len(cep_limpo) != 8:
            logger.warning(f"CEP inválido: {cep}")
            return None
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{GeocodingService.BRASILAPI_URL}/{cep_limpo}")
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Monta o endereço completo
                    street = data.get('street', '')
                    neighborhood = data.get('neighborhood', '')
                    city = data.get('city', '')
                    state = data.get('state', '')
                    
                    endereco_completo = f"{street}, {neighborhood}, {city} - {state}".strip()
                    
                    # Tenta obter coordenadas da BrasilAPI
                    location = data.get("location", {})
                    coordinates = location.get("coordinates", {})
                    latitude = coordinates.get("latitude")
                    longitude = coordinates.get("longitude")
                    
                    # Se BrasilAPI não retornou coordenadas, usa Nominatim como fallback
                    if not latitude or not longitude:
                        logger.info(f"BrasilAPI sem coordenadas, usando Nominatim para CEP {cep}")
                        coords = await GeocodingService._geocode_with_nominatim(street or neighborhood, city, state)
                        if coords:
                            latitude, longitude = coords
                    
                    if latitude and longitude:
                        logger.info(f"Geocodificação bem-sucedida para CEP {cep}: ({latitude}, {longitude})")
                        return (float(latitude), float(longitude), endereco_completo)
                    
                    logger.warning(f"Não foi possível obter coordenadas para o CEP: {cep}")
                    # Retorna o endereço mesmo sem coordenadas
                    return None
                else:
                    logger.error(f"Erro ao buscar CEP {cep}: Status {response.status_code}")
                    return None
                    
        except httpx.TimeoutException:
            logger.error(f"Timeout ao buscar CEP {cep}")
            return None
        except Exception as e:
            logger.error(f"Erro ao geocodificar CEP {cep}: {str(e)}")
            return None
    
    @staticmethod
    async def get_address_from_cep(cep: str) -> Optional[str]:
        """
        Busca apenas o endereço completo a partir de um CEP.
        
        Args:
            cep: CEP no formato "12345-678" ou "12345678"
        
        Returns:
            Endereço completo como string ou None se falhar
        """
        result = await GeocodingService.get_coordinates_from_cep(cep)
        if result:
            return result[2]  # Retorna apenas o endereço
        return None
