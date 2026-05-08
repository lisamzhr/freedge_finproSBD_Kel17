const Fuse = require('fuse.js');

exports.findSimilarItem = (inputName, items) => {
  if (!items || items.length === 0) return { match: false, item: null, similarity: 0 };

  const fuse = new Fuse(items, {
    keys: ['normalizedName'],
    includeScore: true,
    threshold: 0.3,
  });

  const results = fuse.search(inputName);
  if (results.length === 0) return { match: false, item: null, similarity: 0 };

  const best = results[0];
  const similarity = Math.round((1 - best.score) * 100);

  return { match: true, item: best.item, similarity };
};