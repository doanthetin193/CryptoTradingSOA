"""Consul registration helpers for the sentiment service."""

import logging

import httpx

from config import (
    CONSUL_ENABLED,
    CONSUL_HOST,
    CONSUL_PORT,
    HTTP_TIMEOUT_SECONDS,
    PORT,
    SERVICE_HOST,
    SERVICE_ID,
    SERVICE_NAME,
)


logger = logging.getLogger("sentiment-service.consul")


def _consul_url(path: str) -> str:
    return f"http://{CONSUL_HOST}:{CONSUL_PORT}{path}"


async def register_service() -> None:
    if not CONSUL_ENABLED:
        logger.info("Consul registration disabled")
        return

    payload = {
        "ID": SERVICE_ID,
        "Name": SERVICE_NAME,
        "Address": SERVICE_HOST,
        "Port": PORT,
        "Tags": ["soa", "crypto-trading", "python", "ai"],
        "Check": {
            "HTTP": f"http://{SERVICE_HOST}:{PORT}/sentiment/health",
            "Interval": "10s",
            "Timeout": "5s",
            "DeregisterCriticalServiceAfter": "1m",
        },
    }

    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as client:
            response = await client.put(_consul_url("/v1/agent/service/register"), json=payload)
            response.raise_for_status()
        logger.info("Registered with Consul: %s (%s)", SERVICE_NAME, SERVICE_ID)
    except Exception as exc:
        logger.warning("Could not register with Consul: %s", exc)


async def deregister_service() -> None:
    if not CONSUL_ENABLED:
        return

    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT_SECONDS) as client:
            response = await client.put(_consul_url(f"/v1/agent/service/deregister/{SERVICE_ID}"))
            response.raise_for_status()
        logger.info("Deregistered from Consul: %s", SERVICE_ID)
    except Exception as exc:
        logger.warning("Could not deregister from Consul: %s", exc)
