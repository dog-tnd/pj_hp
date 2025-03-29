/**
 * 日付をフォーマットする関数
 * @param dateString - 日付文字列
 * @returns フォーマットされた日付文字列
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }