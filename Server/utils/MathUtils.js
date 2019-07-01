module.exports = {
    getRandomValues: (Min, Max) => {
        let Range = Max - Min;
        let Rand = Math.random();
        return (Min + Math.round(Rand * Range));
    }
};