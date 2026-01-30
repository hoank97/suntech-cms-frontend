module.exports = {
    apps: [
        {
            name: 'cms-frontend',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                PORT: 3003,
            },
            max_memory_restart: '1G',
            mode: 'fork',
            watch: false,
            ignore_watch: ["node_modules", ".git", "logs"],
            max_restarts: 10,
            min_uptime: 1000,
            max_uptime: 1000,
            restart_delay: 1000,
        },
    ],
}
