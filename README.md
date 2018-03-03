# RecastCLI

A command line tools to build navigation mesh for game, which means you can automatically generate navigation mesh on server or localhost.

> Based on [recastnavigation](https://github.com/recastnavigation/recastnavigation) under ZLib license

### Building

![](https://user-images.githubusercontent.com/7625588/36931376-1824eb9e-1eef-11e8-84f6-02b93cfce723.png)

### Usage

![](https://user-images.githubusercontent.com/7625588/36931426-d560d6aa-1eef-11e8-96a2-14812f7994a3.png)

```shell
$ ./RecastCLI nav_test.obj 0 0 0 0 0 0 0 0 0 0 0 0 0 > navmesh.obj
```

#### Order

 - cellSize
 - cellHeight
 - agentHeight
 - agentRadius
 - agentMaxClimp
 - agentMaxSlope
 - regionMinSize
 - regionMergeSize
 - edgeMaxLen
 - edgeMaxError
 - vertsPerPoly
 - detailSampleDist
 - detailSampleMaxErro