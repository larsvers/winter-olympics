### Winter Olympics

*Winter Olympics* is an interactive data history of the — well — Winter Olympics. It guides the reader through all the 22 Winter Games that happened since 1922. While passing through, it highlights a few so far maybe under-highlighted bits of Olympic history in a story as well as in data.

I mainly blame my honest feelings for map design, white sports and visual storytelling for this interactive. And while there might be more pressing topics to attend to at the minute (Brexit/Trump, dear friend from the future) this might offer a brief moment of tranquility.

It has 5 moving parts all tightly coupled. The main focus is on the story evolving from the 1922 Games in Chamonix to the 2014 Olympics in Sochi. All other pieces are at the story's service as they update accordingly. The map is gratuitiously flying you to each destination as you scroll along. Showing you all event locations of the respective Olympics. At the bottom are three visual representations of Olympic data:

*   The conventional medal count wrapped up in a maybe slightly unconvetional grid-graph.
*   A force-directed ball of athletes giving you an idea of the number of athletes and their gender,
*   and a treemap showing the sports exercised and on hover the individual disciplines per sport sorted by the number of events.

The parts in pictures:

![rt](images/other/winter_olympics_explain.png)

### Why do such thing?

Well, thematically, the next Olympics are happening in Feb 2018, so it's time to prepare. Even if you're not a big friend of the Olympics (my moderate excitement has decreased significantly with systematically state-funded doping in Sochi) it's an amusing history with a few entertaining facts compiled here. And at least equally important than the historical amusement bit was my friendship with data storytelling plus a combination of webGL, canvas and D3. A tasty technical soup to slurp. After peeking into a few pots, I settled for [Mapbox GL](https://www.mapbox.com/mapbox-gl-js/api/) to build the map. And it was very kind to me. It has a clean, well-documented API with a lot of convenience methods saving sweat and tears. It's also based on webGL — the fastest cowboy in town — and uses vector rather than raster tiles to keep the rendering speed up. It also makes map designing a breeze with [Mapbox Studio](https://www.mapbox.com/mapbox-studio). The fun !

And then there was [this map](https://www.mapbox.com/blog/ski-mapbox-studio/) designed by [Amy Lee Walton](https://www.mapbox.com/about/team/amy-lee-walton/) which sparked the idea and fuelled the process. All map design kudos go directly to her...

The data was mainly scraped from [Wikipedia](https://en.wikipedia.org/wiki/Winter_Olympic_Games) and [Olympic.org](https://www.olympic.org). Much more trawling and data synthesis than analysis for this project . I would have liked to include some more data — especially of the financial kind — as well as a time-series perspective but I refrained to keep it the animal in scope.

### The process in a gif

Process is interesting. The path from blank slate to finished visual follows numerous intersections producing rich yet usually private monologues. While well-written process notes can illuminate this secret world of the developper/designer (devigner?), a small gif saves some paper for now:

![rt](images/other/winter_olympics_process.gif)


### The code

This project is implemented a little naively. No ES6, hence no modules, no D3 rolly-upy, no bundling, no npm. I know. My options were to either spend time to sweep through it with the refactor broom or spend the same time to start a new project. As the project works in a reasonably performant way, I opted for the much more tempting new project option which will tick all the necesary box-ticks for a web thingy in the 21st century. Don't do this at home.

Happy days ! I hope more will follow over at [freeCodeCamp](https://medium.freecodecamp.com/d3-and-canvas-in-3-steps-8505c8b27444#.pfx01hww5)