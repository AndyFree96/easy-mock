<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getStats } from '@/api/mock';
import type { StatsResponse } from '@/types/mock';

const stats = ref<StatsResponse>();
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const res = await getStats();
    stats.value = res.data;
  } catch {
    /* empty */
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="stats-panel" v-loading="loading">
    <el-row :gutter="16">
      <el-col :span="8">
        <el-statistic title="Total Requests" :value="stats?.totalRequests ?? 0" />
      </el-col>
      <el-col :span="8">
        <el-statistic title="Avg Time" :value="stats?.avgResponseTime ?? 0" suffix="ms" :precision="1" />
      </el-col>
      <el-col :span="8">
        <el-statistic title="Last Hour" :value="stats?.requestsLastHour ?? 0" />
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 24px">
      <el-col :span="12">
        <h4 style="margin-bottom: 8px">Method Distribution</h4>
        <el-table
          :data="stats?.methodDistribution ?? []"
          empty-text="No data"
          size="small"
        >
          <el-table-column prop="method" label="Method" />
          <el-table-column prop="count" label="Count" width="100" />
        </el-table>
      </el-col>
      <el-col :span="12">
        <h4 style="margin-bottom: 8px">Top Paths</h4>
        <el-table
          :data="stats?.topPaths ?? []"
          empty-text="No data"
          size="small"
        >
          <el-table-column prop="method" label="Method" width="70" />
          <el-table-column prop="path" label="Path" />
          <el-table-column prop="count" label="Hits" width="60" />
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>
