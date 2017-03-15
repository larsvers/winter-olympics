### Winter Olympics

*Winter Olympics* is an interactive data history of the — well — Winter Olympics. Starting at the first Olympics in 1924 the reader can read a little tale for each event in the text box to the right. When scrolling from event to event the map in the center-left updates with a gratuitous flight to the appropriate venues. At the same time, statistics about participating nations, medals won, number of athletes, their gender ratio and of course sports shown are updated in the bottom third of the screen.

The moving parts in pictures:

![rt](images/other/winter_olympics_explain.png)

### Why do such thing?

Thematically, the next Olympics are happening in Feb 2018, so it might be time to prepare. Even if you're not a big friend of the Olympics it's an amusing history with entertaining facts. For me the data-driven narrative combined with webGL, canvas and D3 was an interesting combination, a tasty technical soup to slurp. I used [Mapbox GL](https://www.mapbox.com/mapbox-gl-js/api/) to build the map and some of the animations and it was very kind to me. It has a clean, well-documented API with a lot of convenience methods saving sweat and tears. It's based on webGL — the fastest cowboy in town — and uses vector rather than raster tiles to keep the rendering speed up. It also makes map designing a breeze with [Mapbox Studio](https://www.mapbox.com/mapbox-studio). What fun.

And then there was [this map](https://www.mapbox.com/blog/ski-mapbox-studio/) designed by [Amy Lee Walton](https://www.mapbox.com/about/team/amy-lee-walton/) which sparked the idea and fuelled the design of all other elements.

The data was mainly scraped from [Wikipedia](https://en.wikipedia.org/wiki/Winter_Olympic_Games) and [Olympic.org](https://www.olympic.org). Much more trawling and data synthesis than analysis for this project. I would have liked to include some more data — especially of the financial kind — as well as a time-series perspective but I refrained to keep the animal in scope.

### The process in a gif

Process is interesting. The path from blank slate to finished visual follows numerous intersections producing rich yet usually private monologues. While well-written process notes can illuminate this basement of the developper/designer (devigner?), a small gif saves some paper for now:

![rt](images/other/winter_olympics_process.gif)

### The code

The project architecture is a little retro. No ES6, hence no modules, no D3 rolly-upy, no bundling, no npm. I know. My options were to either spend time to sweep through it with the refactor broom or spend the same time to start a new project. As the project works in a reasonably performant way, I opted for the much more tempting new project option which shall tick all the necesary boxes for 21st century development. Don't do this at home.

Happy days ! I hope more will follow over at [freeCodeCamp](https://medium.freecodecamp.com/d3-and-canvas-in-3-steps-8505c8b27444#.pfx01hww5)