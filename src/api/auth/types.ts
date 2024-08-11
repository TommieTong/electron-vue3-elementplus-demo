/**
 * 登录请求参数
 */
export interface LoginData {
  /**
   * 用户名
   */
  username?: string;
  /**
   * 密码
   */
  password?: string;
}

/**
 * 登录响应
 */
export interface LoginResult {
  /**
   * 访问token
   */
  accessToken?: string;
}

/**
 * 用户信息 
 */
export interface UserInfo {
  /**
   * 用户名
   */
  nickName: string;

  /**
   * 用户id
   */
  userId: string;

  /**
   * 年龄
   */
  age: number;
}