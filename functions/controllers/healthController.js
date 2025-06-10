/**
 * ヘルスチェック・システム情報関連のコントローラー
 */

const config = require('../config');
const OpenAIService = require('../services/openaiService');
const AnniversaryService = require('../services/anniversaryService');

class HealthController {
  constructor() {
    this.openaiService = new OpenAIService();
    this.anniversaryService = new AnniversaryService();
  }

  /**
   * 基本ヘルスチェック
   */
  getHealth(req, res) {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.server.environment,
        version: process.env.npm_package_version || '1.0.0',
      };

      res.json(healthStatus);
    } catch (error) {
      console.error('Error in health check:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * 詳細なヘルスチェック（依存サービスの状態も含む）
   */
  async getDetailedHealth(req, res) {
    try {
      const startTime = Date.now();

      // 基本システム情報
      const systemInfo = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: config.server.environment,
        node_version: process.version,
        pid: process.pid,
      };

      // 依存サービスのチェック
      const dependencies = {
        openai: {
          configured: this.openaiService.isConfigValid(),
          status: 'unknown',
        },
        anniversary: {
          status: 'healthy',
          data_loaded: true,
        },
      };

      // OpenAI API接続テスト（簡易）
      try {
        if (dependencies.openai.configured) {
          dependencies.openai.status = 'healthy';
        } else {
          dependencies.openai.status = 'misconfigured';
          dependencies.openai.error = 'API Key not configured';
        }
      } catch (error) {
        dependencies.openai.status = 'unhealthy';
        dependencies.openai.error = error.message;
      }

      // 記念日データのチェック
      try {
        const stats = this.anniversaryService.getStatistics();
        dependencies.anniversary.statistics = stats;
        dependencies.anniversary.data_loaded = stats.totalAnniversaries > 0;
      } catch (error) {
        dependencies.anniversary.status = 'unhealthy';
        dependencies.anniversary.error = error.message;
      }

      const responseTime = Date.now() - startTime;

      // 全体的な健康状態を判定
      const overallStatus = Object.values(dependencies).every(
        dep => dep.status === 'healthy'
      ) ? 'healthy' : 'degraded';

      res.json({
        ...systemInfo,
        status: overallStatus,
        response_time_ms: responseTime,
        dependencies,
      });

    } catch (error) {
      console.error('Error in detailed health check:', error);
      res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * ルートエンドポイント
   */
  getRoot(req, res) {
    try {
      res.json({
        message: 'success',
        status: 'healthy',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in root endpoint:', error);
      res.status(500).json({
        status: 'failed',
        error: error.message,
      });
    }
  }

}

module.exports = HealthController;
