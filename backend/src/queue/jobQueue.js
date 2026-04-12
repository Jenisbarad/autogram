const { Queue, QueueEvents } = require('bullmq');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const REDIS_CONNECTION = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
};

const QUEUES = {
    CONTENT_SEARCH: 'contentSearch',
    MEDIA_DOWNLOAD: 'mediaDownload',
    QUALITY_CHECK: 'qualityCheck',
    VIRAL_SCORE: 'viralScore',
    MEDIA_PROCESSING: 'mediaProcessing',
    CAPTION_GENERATION: 'captionGeneration',
    INSTAGRAM_POST: 'instagramPost',
};

// Create queues
const queues = {};
for (const [key, name] of Object.entries(QUEUES)) {
    queues[name] = new Queue(name, {
        connection: REDIS_CONNECTION,
        defaultJobOptions: {
            attempts: parseInt(process.env.JOB_ATTEMPTS) || 3,
            backoff: {
                type: 'exponential',
                delay: parseInt(process.env.JOB_BACKOFF_MS) || 5000,
            },
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 50 },
        },
    });
}

async function addJob(queueName, jobName, data, opts = {}) {
    const queue = queues[queueName];
    if (!queue) throw new Error(`Queue not found: ${queueName}`);
    return queue.add(jobName, data, opts);
}

function setupBullBoard() {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/bull-board');

    createBullBoard({
        queues: Object.values(queues).map(q => new BullMQAdapter(q)),
        serverAdapter,
    });

    return { serverAdapter };
}

function getQueue(name) {
    return queues[name];
}

module.exports = { queues, addJob, setupBullBoard, getQueue, QUEUES, REDIS_CONNECTION };
