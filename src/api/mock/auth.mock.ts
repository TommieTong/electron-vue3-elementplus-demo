import { MockHandler } from 'vite-plugin-mock-server';
import { LoginResult, UserInfo } from '../auth/types';
import Mock from 'mockjs';

// 通用请求返回结果
const resData = {
  code: '0', // 状态码
  data: {} // 响应数据
};
const mocks: MockHandler[] = [
  {
    pattern: '/api/auth/login',
    handle: (req, res) => {
      const result: LoginResult = {
        accessToken: 'xaxacaca'
      };
      resData.data = result;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(resData));
    }
  },
  {
    pattern: '/api/auth/userInfo',
    handle: (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      // 使用mock.js模拟响应结果
      resData.data = Mock.mock({
        userId: '@id', // 随机id
        nickName: '@cname', // 随机中文名称
        'age|18-35': 18, // 随机年龄 18-35
      });
      res.end(JSON.stringify(resData));
    }
  },
];

export default mocks;
