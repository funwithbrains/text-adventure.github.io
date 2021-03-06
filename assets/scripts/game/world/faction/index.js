define(['utils'], ({ _, random, collection }) => {
  const createFaction = (rng, diversity, civility, raceSystem) => {
    // TODO select faction ideology based on diversity and civility
    const raceSampler = raceSystem.createSamplerBucket(civility);
    
    // TODO allow replacement of compound races for re-selection from bucket
    // OR when selecting one, allow it to be duplicated immediately with different components
    const races = collection.filterMapRange(0, diversity, () => {
      return raceSampler.sample(rng);
    });

    return {
      races
    };
  };

  const createSystem = ({
    worldRng,
    worldConfig,
    raceSystem
  }) => {
    const uniformRng = worldRng.createSubSource('factionUniform');
    const normalRng = worldRng.createSubSource('factionNormal', random.distribution.normal);
    const wilderness = createFaction(uniformRng, 30, 0, raceSystem);

    const civilizationCount = normalRng.sampleIntRange(1, 10);
    const civilizations = collection.mapRange(0, civilizationCount, () => {
      const diversity = normalRng.sampleIntRange(1, 5);
      return createFaction(uniformRng, diversity, 100, raceSystem);
    });

    return {
      wilderness,
      civilizations
    };
  };

  return {
    createSystem
  };
});
