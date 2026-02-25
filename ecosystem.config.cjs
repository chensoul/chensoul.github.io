module.exports = {
  apps: [
    {
      name: "blog",
      cwd: __dirname,
      script: "pnpm",
      args: "run preview -- --allowed-hosts=blog.chensoul.cc",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      restart_delay: 5000,
    },
  ],
};