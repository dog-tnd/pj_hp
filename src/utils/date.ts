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

/**
 * 日付を "YYYY.MM.DD" 形式にフォーマットする関数
 * microCMS の publishedAt（ISO 8601）を既存の表示形式に合わせる
 * @param dateString - 日付文字列（ISO 8601 等）
 * @returns "YYYY.MM.DD" 形式の文字列
 */
export function formatDotDate(dateString: string | undefined | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return ''; // 無効な日付は空文字（非表示用）
  // 日本時間(JST)基準で整形。ビルド環境のTZ（CIはUTC）に依存させない
  const parts = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}.${get('month')}.${get('day')}`;
}