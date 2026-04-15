import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface StockPriceCache {
  price: number;
  volume: number;
  updated: number;
  fetchedAt: Date;
}

export interface StockPriceResponse {
  ticker: string;
  price: number;
  volume: number;
  updated: number;
}

@Injectable()
export class StockPriceService {
  private readonly logger = new Logger(StockPriceService.name);
  private readonly apiKey = 'mOp0KC6davHzlfe0EFhqAlHBa2wB8iZl0hKea5o1';
  private readonly apiUrl = 'https://api.api-ninjas.com/v1/stockprice';
  private readonly cacheLifetime = 24 * 60 * 60 * 1000; // 24 horas en ms
  
  // Caché en memoria (en producción considerar Redis)
  private priceCache: Map<string, StockPriceCache> = new Map();

  constructor(private configService: ConfigService) {}

  /**
   * Obtiene el precio de una acción (con caché de 24h)
   */
  async getStockPrice(ticker: string): Promise<StockPriceResponse | null> {
    const upperTicker = ticker.toUpperCase();
    
    // Verificar si está en caché y no expiró
    const cached = this.priceCache.get(upperTicker);
    if (cached && this.isCacheValid(cached.fetchedAt)) {
      this.logger.log(`[Stock Price] Cache hit for ${upperTicker}`);
      return {
        ticker: upperTicker,
        price: cached.price,
        volume: cached.volume,
        updated: cached.updated,
      };
    }

    // Hacer request a API Ninjas
    try {
      this.logger.log(`[Stock Price] Fetching ${upperTicker} from API Ninjas`);
      const response = await axios.get(this.apiUrl, {
        params: { ticker: upperTicker },
        headers: { 'X-Api-Key': this.apiKey },
        timeout: 10000,
      });

      const data = response.data;
      
      // Guardar en caché
      this.priceCache.set(upperTicker, {
        price: data.price,
        volume: data.volume,
        updated: data.updated,
        fetchedAt: new Date(),
      });

      this.logger.log(`[Stock Price] ${upperTicker} cached: $${data.price}`);
      
      return {
        ticker: upperTicker,
        price: data.price,
        volume: data.volume,
        updated: data.updated,
      };
    } catch (error) {
      this.logger.error(`[Stock Price] Error fetching ${upperTicker}:`, error.message);
      return null;
    }
  }

  /**
   * Obtiene precios de múltiples tickers (batch)
   */
  async getStockPrices(tickers: string[]): Promise<Record<string, StockPriceResponse | null>> {
    const results: Record<string, StockPriceResponse | null> = {};
    
    // Procesar secuencialmente para evitar rate limits
    for (const ticker of tickers) {
      results[ticker.toUpperCase()] = await this.getStockPrice(ticker);
      // Pequeño delay entre requests si hay múltiples
      if (tickers.length > 1) {
        await this.delay(100);
      }
    }
    
    return results;
  }

  /**
   * Invalida el caché de un ticker específico
   */
  invalidateCache(ticker: string): void {
    this.priceCache.delete(ticker.toUpperCase());
    this.logger.log(`[Stock Price] Cache invalidated for ${ticker.toUpperCase()}`);
  }

  /**
   * Limpia todo el caché
   */
  clearCache(): void {
    this.priceCache.clear();
    this.logger.log('[Stock Price] All cache cleared');
  }

  /**
   * Verifica si el caché aún es válido (menos de 24h)
   */
  private isCacheValid(fetchedAt: Date): boolean {
    const now = new Date().getTime();
    const cacheTime = fetchedAt.getTime();
    return now - cacheTime < this.cacheLifetime;
  }

  /**
   * Delay helper para rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Obtiene estadísticas del caché (útil para debugging)
   */
  getCacheStats(): { size: number; tickers: string[] } {
    return {
      size: this.priceCache.size,
      tickers: Array.from(this.priceCache.keys()),
    };
  }
}
