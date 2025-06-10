/**
 * 記念日サービス
 */

const anniversaryJSON = require('../year_anniversary.json');

class AnniversaryService {
  /**
   * 指定された月日の記念日を取得
   * @param {number} month - 月 (1-12)
   * @param {number} date - 日 (1-31)
   * @returns {Array<string>} - 記念日のリスト
   */
  getAnniversaries(month, date) {
    try {
      const today = `${month}/${date}`;
      const monthIndex = month - 1;
      
      if (monthIndex < 0 || monthIndex >= anniversaryJSON.length) {
        throw new Error(`Invalid month: ${month}`);
      }

      const monthData = anniversaryJSON[monthIndex];
      const todayAnniversaries = monthData[today];

      return todayAnniversaries || [];
    } catch (error) {
      console.error('Anniversary service error:', error);
      return [];
    }
  }

  /**
   * ランダムな記念日を1つ取得
   * @param {number} month - 月 (1-12)
   * @param {number} date - 日 (1-31)
   * @returns {string|null} - ランダムな記念日、またはnull
   */
  getRandomAnniversary(month, date) {
    const anniversaries = this.getAnniversaries(month, date);
    
    if (anniversaries.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * anniversaries.length);
    return anniversaries[randomIndex];
  }

  /**
   * 日付の妥当性を検証
   * @param {number} month - 月 (1-12)
   * @param {number} date - 日 (1-31)
   * @returns {boolean} - 日付が妥当かどうか
   */
  isValidDate(month, date) {
    if (typeof month !== 'number' || typeof date !== 'number') {
      return false;
    }

    if (month < 1 || month > 12) {
      return false;
    }

    if (date < 1 || date > 31) {
      return false;
    }

    // 簡単な日付妥当性チェック
    const dateObj = new Date(2024, month - 1, date);
    return dateObj.getMonth() === month - 1 && dateObj.getDate() === date;
  }

  /**
   * 今日の日付を取得
   * @returns {Object} - {month, date}
   */
  getTodayDate() {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      date: now.getDate(),
    };
  }

  /**
   * 記念日データの統計情報を取得
   * @returns {Object} - 統計情報
   */
  getStatistics() {
    let totalAnniversaries = 0;
    let totalDates = 0;

    anniversaryJSON.forEach(monthData => {
      Object.keys(monthData).forEach(dateKey => {
        totalDates++;
        totalAnniversaries += monthData[dateKey].length;
      });
    });

    return {
      totalMonths: anniversaryJSON.length,
      totalDates,
      totalAnniversaries,
      averagePerDate: totalAnniversaries / totalDates,
    };
  }
}

module.exports = AnniversaryService;
