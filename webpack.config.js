module.exports = {
  // 其他配置项
  resolve: {
    fallback: {
      "stream": require.resolve("stream-browserify"),
      // 你可以在此添加其他可能缺失的 polyfill
    }
  }
};
