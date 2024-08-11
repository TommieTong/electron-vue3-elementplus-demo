<template>
  <div class="welcome-container">
    <img class="welcome-image" src="@/assets/icon.png" alt="Welcome Image" />
    <h1 class="welcome-text">Demo系统</h1>
    <h2 class="welcome-subtext">欢迎登录</h2>
    <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="login-form">
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="Username" prefix-icon="el-icon-user" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="Password" prefix-icon="el-icon-lock" />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="rememberMe" @change="toggleRememberMe">记住账号密码</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">Login</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router'; // 引入路由管理器

const router = useRouter(); // 获取路由实例

const loginFormRef = ref(null);
const loginForm = reactive({
  username: '',
  password: ''
});

const rememberMe = ref(false);

const rules = reactive({
  username: [
    { required: true, message: 'Please input your username', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Please input your password', trigger: 'blur' },
  ]
});

const toggleRememberMe = () => {
  if (rememberMe.value) {
    localStorage.setItem('username', loginForm.username);
    localStorage.setItem('password', loginForm.password);
  } else {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
  }
};

const submitForm = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      // 假设有一个 API 可以验证用户名和密码
      try {
        const response = await authenticateUser(loginForm.username, loginForm.password);
        if (response.success) {
          ElMessage.success('Login success!');
          router.push('/index'); // 登录成功后跳转
        } else {
          showError('Invalid username or password!');
        }
      } catch (error) {
        showError('An error occurred during login.');
      }
    } else {
      console.log('error submit!!');
      return false;
    }
  });
};

// 假设这是你的 API 调用函数
const authenticateUser = async (username, password) => {
  // 这里应该是一个真实的 API 调用
  // 为了演示，我们使用一个模拟的 Promise
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: username === 'admin' && password === 'admin' }), 1000)
  );
};

// 在 setup() 内部定义 ElMessage 的调用
const showError = (message) => {
  ElMessage.error(message);
};
</script>

<style scoped>
.welcome-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.welcome-image {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.welcome-text {
  font-size: 24px;
  margin-bottom: 20px;
  letter-spacing: 2px;
}

.welcome-subtext {
  font-size: 18px;
  margin-bottom: 40px;
}

.login-form {
  width: 300px;
  margin: 0 auto;
}
</style>