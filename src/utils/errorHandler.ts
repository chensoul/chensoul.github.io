/**
 * 错误处理工具
 *
 * @fileoverview 提供统一的错误处理和日志记录功能
 *
 * 核心功能：
 * 1. 安全执行函数并捕获错误
 * 2. 统一的错误日志格式
 * 3. 提供降级方案（fallback）
 * 4. 支持异步函数
 *
 * 使用场景：
 * - 数据获取失败时的降级处理
 * - API 调用的错误捕获
 * - 第三方库调用的安全包装
 *
 * 依赖关系：
 * - 被需要错误处理的工具函数和组件调用
 */

/**
 * 安全执行同步函数
 *
 * 工作原理：
 * 1. 尝试执行传入的函数
 * 2. 如果执行成功，返回结果
 * 3. 如果抛出错误，记录错误日志并返回降级值
 *
 * @param fn - 需要执行的函数
 * @param fallback - 发生错误时的降级返回值
 * @param context - 错误上下文描述（用于日志）
 * @returns 函数执行结果或降级值
 *
 * @example
 * // 安全获取文章列表
 * const posts = safeExecute(
 *   () => PostUtils.sort(allPosts),
 *   [],
 *   "PostUtils.sort"
 * );
 * // 如果 PostUtils.sort 抛出错误，返回空数组 []
 *
 * @example
 * // 安全解析 JSON
 * const data = safeExecute(
 *   () => JSON.parse(jsonString),
 *   null,
 *   "JSON.parse"
 * );
 */
export function safeExecute<T>(
  fn: () => T,
  fallback: T,
  context?: string
): T {
  try {
    return fn();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[Error${context ? ` in ${context}` : ""}]:`,
      errorMessage,
      error
    );
    return fallback;
  }
}

/**
 * 安全执行异步函数
 *
 * 工作原理：
 * 1. 尝试执行传入的异步函数
 * 2. 如果执行成功，返回 Promise 结果
 * 3. 如果抛出错误或 Promise 被拒绝，记录错误日志并返回降级值
 *
 * @param fn - 需要执行的异步函数
 * @param fallback - 发生错误时的降级返回值
 * @param context - 错误上下文描述（用于日志）
 * @returns Promise，包含函数执行结果或降级值
 *
 * @example
 * // 安全获取远程数据
 * const data = await safeExecuteAsync(
 *   async () => {
 *     const response = await fetch('/api/posts');
 *     return response.json();
 *   },
 *   [],
 *   "fetchPosts"
 * );
 *
 * @example
 * // 安全读取本地存储
 * const settings = await safeExecuteAsync(
 *   async () => {
 *     const data = localStorage.getItem('settings');
 *     return JSON.parse(data);
 *   },
 *   { theme: 'light' },
 *   "loadSettings"
 * );
 */
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[Async Error${context ? ` in ${context}` : ""}]:`,
      errorMessage,
      error
    );
    return fallback;
  }
}

/**
 * 创建错误边界
 *
 * 用于包装可能出错的代码块，提供统一的错误处理
 *
 * @param errorHandler - 错误处理函数
 * @returns 包装后的执行函数
 *
 * @example
 * const withErrorBoundary = createErrorBoundary((error) => {
 *   console.error('发生错误:', error);
 *   showNotification('操作失败，请重试');
 * });
 *
 * withErrorBoundary(() => {
 *   // 可能出错的代码
 *   riskyOperation();
 * });
 */
export function createErrorBoundary(
  errorHandler: (error: Error) => void
): <T>(fn: () => T, fallback?: T) => T | undefined {
  return function <T>(fn: () => T, fallback?: T): T | undefined {
    try {
      return fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errorHandler(err);
      return fallback;
    }
  };
}

/**
 * 重试函数
 *
 * 当函数执行失败时，自动重试指定次数
 *
 * @param fn - 需要执行的函数
 * @param maxRetries - 最大重试次数
 * @param delay - 重试间隔（毫秒）
 * @returns Promise，包含函数执行结果
 *
 * @example
 * // 重试 API 请求
 * const data = await retry(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     if (!response.ok) throw new Error('请求失败');
 *     return response.json();
 *   },
 *   3,  // 最多重试 3 次
 *   1000 // 每次间隔 1 秒
 * );
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 如果还有重试次数，等待后继续
      if (i < maxRetries) {
        console.warn(
          `[Retry ${i + 1}/${maxRetries}] 执行失败，${delay}ms 后重试:`,
          lastError.message
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // 所有重试都失败，抛出最后一个错误
  throw lastError!;
}
