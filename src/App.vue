<script setup lang="ts"></script>

<template>
	<div class="main-container">
		<el-container>
      <el-aside v-if="!$route.meta.hideSide" width="max-content">
        <BaseSide />
      </el-aside>
			<el-container>
				<el-main>
					<router-view></router-view>
				</el-main>
			</el-container>
		</el-container>
	</div>
</template>

<script setup>
import Login from "./components/Login/Login.vue";
import BaseHeader from "./components/layouts/BaseHeader.vue";
import BaseSide from "./components/layouts/BaseSide.vue";

// const router = useRouter();

</script>

<style>
router-view {
	display: block;
	/* height: 100vh; */
}

.main-container {
	height: 100vh;
}

.el-container {
	height: 100%;
	overflow-y: hidden;
}
</style>
