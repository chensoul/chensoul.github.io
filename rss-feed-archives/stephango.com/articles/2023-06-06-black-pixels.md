---
title: "Black pixels"
date: 2023-06-06
source: https://stephango.com/black-pixels
site: "https://stephango.com"
feed: "https://stephango.com/feed.xml"
author: "Steph Ango"
---
One of my first industrial design jobs was working on a headset that never shipped, for a now defunct startup. It used two micro-OLED displays similar to the ones in Apple’s Vision Pro, but with clear, see-through optics reflected into the eye through a kind of one-way mirror lenses ([beam-splitters](https://en.wikipedia.org/wiki/Beam_splitter)).

In retrospect, it was crazy to think that a small independent startup could bring together all the necessary technology to make this happen.

One thing we got wrong is that we believed in the superiority of a see-through optical system. At the time, around 2011, this seemed like a much better approach, because there was no latency or distortion when looking at the real world. But since then I became convinced that a pass-through display is the best near-term solution.

The reason is simple. You need black pixels.

What Apple showed this week is that we now have the technology to make the camera-to-display pipeline imperceptibly responsive and high-resolution.

If you have ever watched a sci-fi movie with HUDs or holographic interfaces you’ll notice that the backgrounds of the environments are always dark. That’s because these displays can only project light, on a spectrum from transparent to white.

<figure class="wide">
<img src="https://kepano.s3.amazonaws.com/prometheus-ui.jpg" alt="Scene from Prometheus" />
<figcaption>Holographic interface from <em>Prometheus</em> (2012)</figcaption>
</figure>

While this looks very cool, it is quite impractical in every day use, and significantly reduces the usefulness of the device. For all practical purposes any device that works with a see-through optics is going to have this limitation.

Apple’s Vision Pro demos highlight three key things you just can’t do without black pixels:

1.  Black text and black backgrounds
2.  Virtual shadows
3.  Environmental dimming

If you want to be able to have any kind of true black text in a mixed reality setting, you need to be able to control the rendering of the image from the ground up.

Apple encourages digital elements to cast virtual shadows on real world objects, and provides the necessary tools to do so easily.

<figure class="wide">
<img src="https://kepano.s3.amazonaws.com/vision-pro-hello.jpeg" alt="Example of a digital element casting a dark shadow" />
<figcaption>This still from Apple shows a digital element casting a digital shadow on a real world table</figcaption>
</figure>

Apple also shows how you can dim the entire environment to a darker color, to bring digital elements to the forefront. In the example below you can even see an album cover with a completely black background.

<figure class="wide">
<img src="https://kepano.s3.amazonaws.com/vision-pro-dimming.jpeg" alt="Example showing the environment being darkened digitally" />
<figcaption>This still from Apple shows the environment being darkened digitally</figcaption>
</figure>

The end result feels much more natural, immersive, and opens up more applications.
