/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: ['9000-firebase-clonando-simplebist-1770091277015.cluster-hkcruqmgzbd2aqcdnktmz6k7ba.cloudworkstations.dev'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'admin.cpx-research.com',
            },
            {
                protocol: 'https',
                hostname: 'timewall.io',
            },
            {
                protocol: 'https',
                hostname: 'bitlabs.ai',
            },
            {
                protocol: 'https',
                hostname: 'assets.ysense.com',
            },
            {
                protocol: 'https',
                hostname: 'theoremreach.com',
            },
            {
                protocol: 'https',
                hostname: 'lootably.com',
            },
            {
                protocol: 'https',
                hostname: 'inbrain.ai',
            },
            {
                protocol: 'https',
                hostname: 'adscendmedia.com',
            },
            {
                protocol: 'https',
                hostname: 'www.ayetstudios.com',
            },
            {
                protocol: 'https',
                hostname: 'adgatemedia.com',
            },
            {
                protocol: 'https',
                hostname: 'www.offertoro.com',
            },
            {
                protocol: 'https',
                hostname: 'adgem.com',
            },
        ],
    },
};

module.exports = nextConfig;
