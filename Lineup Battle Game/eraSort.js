const fs = require('fs');

const data = require('./playerAttributes.json');

function getEraTags(start, end) {
    const eras = [
        { tag: "50's", from: 1947, to: 1959 },
        { tag: "60's", from: 1960, to: 1969 },
        { tag: "70's", from: 1970, to: 1979 },
        { tag: "80's", from: 1980, to: 1989 },
        { tag: "90's", from: 1990, to: 1999 },
        { tag: "2000s", from: 2000, to: 2009 },
        { tag: "2010s", from: 2010, to: 2019 },
        { tag: "Modern", from: 2020, to: 2099 }
    ];
    let tags = [];
    eras.forEach(era => {
        if (start <= era.to && end >= era.from) {
            tags.push(era.tag);
        }
    });
    if (end >= 2010) tags.push("Modern");
    return tags;
}

// Add era tags to each player
data.players.forEach(player => {
    if (player.career && Array.isArray(player.career)) {
        const [start, end] = player.career;
        const eraTags = getEraTags(start, end);
        player.tags = Array.from(new Set([...(player.tags || []), ...eraTags]));
    }
});

// Save the updated file
fs.writeFileSync('./playerAttributes.json', JSON.stringify(data, null, 2));