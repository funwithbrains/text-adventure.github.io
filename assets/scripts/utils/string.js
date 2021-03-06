define(['./imports/index', './random', './collection'], ({ _ }, random, collection) => {
  const toNameCase = (string) => {
    return string.replace(/(?:^|\s|-)([a-z])/g, (character) => {
      return character.toUpperCase();
    });
  };

  const createMarkovSource = (strings, order) => {
    const beginnings = [];
    const table = {};
    const endingTable = {};

    strings.forEach(string => {
      beginnings.push(string.slice(0, order));
      const end = string.length - order;
      for (let i = 0; i < end; ++i) {
        const key = string.slice(i, i + order);
        if (!table[key]) {
          table[key] = '';
        }
        table[key] += string[i + order];
      }

      const endingKey = string.slice(-order - order, -order);
      if (!endingTable[endingKey]) {
        endingTable[endingKey] = [];
      }
      endingTable[endingKey].push(string.slice(-order));
    });

    return {
      beginnings,
      table,
      endingTable
    };
  };

  const createBackOffGenerator = (strings, minOrder, maxOrder) => {
    const sources = collection.mapRange(minOrder, maxOrder + 1, order => {
      return createMarkovSource(strings, order);
    });

    const create = (rng, minLength, maxLength) => {
      const length = rng.sampleIntRange(minLength, maxLength);

      let order = minOrder;
      let string = rng.sampleList(sources[order - minOrder].beginnings);

      while (string.length < length) {
        const source = sources[order - minOrder];
        const key = string.slice(-order);

        if (length - string.length <= order && source.endingTable[key]) {
          string += rng.sampleList(source.endingTable[key]);
        } else {
          const items = source.table[key];
          if (items) {
            string += rng.sampleList(items);
            if (order < maxOrder && rng.sample() < 0.5) { // TODO parameterize order escalation probability
              order += 1;
            }
          } else {
            order -= 1;
            if (order < minOrder) { break; }
          }
        }
      }

      return string;
    };

    const createList = (rng, minLength, maxLength, count) => {
      return collection.mapRange(0, count, () => create(rng, minLength, maxLength));
    };

    return {
      strings,
      minOrder,
      maxOrder,
      sources,
      create,
      createList
    };
  };

  return {
    toNameCase,
    createBackOffGenerator
  };
});
