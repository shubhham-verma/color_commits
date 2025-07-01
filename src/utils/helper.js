export const get_age_color = (dateString) => {
    if (!dateString || dateString === 'unknown') return 'text-gray-500';

    const daysOld = Math.floor((Date.now() - new Date(dateString)) / (1000 * 60 * 60 * 24));

    if (daysOld <= 7) return 'text-green-400';
    if (daysOld <= 30) return 'text-yellow-400';
    if (daysOld <= 90) return 'text-orange-400';
    if (daysOld <= 365) return 'text-red-400';
    return 'text-gray-500';
};

export const date_text = (dateString) => {
    if (!dateString || dateString === 'unknown') return 'unknown';

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;

    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''} ago`;
};

export const parse_github_url = (url) => {
    try {
        const formatted_url = new URL(url);
        const parts = formatted_url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
            return {
                owner: parts[0],
                repo: parts[1],
                path: parts[2]
            };
        }
    } catch (error) {
        console.log('error in parse_github_url : ', error);
        return null;
    }
    return null;
};