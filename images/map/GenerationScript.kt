/*
 * this is the script, that I, Antonio Noack, used to convert the xyz files from www.geoportal-th.de to png files
 * it uses the language Kotlin, and my game engine https://github.com/AntonioNoack/RemsEngine as a base-library for reading/writing files & such
 */

package me.anno.utils.test

import me.anno.image.ImageCPUCache
import me.anno.image.ImageWriter
import me.anno.io.files.FileReference.Companion.getReference
import me.anno.io.json.ObjectMapper.write
import me.anno.utils.Color.g
import me.anno.utils.Color.r
import me.anno.utils.Color.rgba
import me.anno.utils.OS.desktop
import me.anno.utils.OS.downloads
import me.anno.utils.hpc.HeavyProcessing
import kotlin.math.roundToInt

fun main() {
    convert()
}

// https://www.geoportal-th.de/de-de/Downloadbereiche/Download-Offene-Geodaten-Th%C3%BCringen/Download-H%C3%B6hendaten
fun convert() {
    val tw = 3000
    val th = 3000
    val joined = IntArray(tw * th)
    val combined = downloads.getChild("heights-combined-jena.zip")
    val children = combined.listChildren()!!
    HeavyProcessing.processUnbalanced(0, children.size, true) { ix0, ix1 ->
        for (ci in ix0 until ix1) {
            val zip = children[ci]
            val name = zip.name.split('_')
            val x0 = (name[1].toInt() - 680) * 1000
            val y0 = (name[2].toInt() - 5644) * 1000
            val i0 = x0 + y0 * tw
            val data = zip.listChildren()!!.first { it.lcExtension == "xyz" }
            val text = data.readText()
            val lines = text
                .split('\n')
                .filter { it.isNotEmpty() }
            val uniqueX = HashSet<Float>()
            val uniqueY = HashSet<Float>()
            for (line in lines) {
                val split = line.split(' ')
                uniqueX += split[0].toFloat()
                uniqueY += split[1].toFloat()
            }
            val width = uniqueX.size
            val height = uniqueY.size
            val minX = uniqueX.minOrNull()!!
            val maxX = uniqueX.maxOrNull()!!
            val minY = uniqueY.minOrNull()!!
            val maxY = uniqueY.maxOrNull()!!
            for (line in lines) {
                val split = line.split(' ')
                val xf = split[0].toFloat()
                val yf = split[1].toFloat()
                val z = split[2].toFloat()
                val x = ((width - 0.01f) * (xf - minX) / (maxX - minX)).toInt()
                val y = ((height - 0.01f) * (yf - minY) / (maxY - minY)).toInt()
                val i = i0 + x + y * tw
                val h = (z * 10f).roundToInt()
                joined[i] = rgba(h.shr(8).and(255), h.and(255), 0, 255)
            }
        }
    }
    ImageWriter.writeRGBImageInt(tw, th, "result3000", 16) { _, _, i ->
        joined[i]
    }
    ImageWriter.writeRGBImageInt(tw / 2, th / 2, "result1500", 16) { x, y, _ ->
        val i = (x * 2) + (y * 2) * tw
        var h = 0
        for (a in 0 until 2) {
            for (b in 0 until 2) {
                val c = joined[i + a + b * tw]
                h += c.r() * 256 + c.g()
            }
        }
        h /= 4
        rgba(h.shr(8).and(255), h.and(255), 0, 255)
    }
    ImageWriter.writeRGBImageInt(tw / 4, th / 4, "result750", 16) { x, y, _ ->
        val i = (x * 4) + (y * 4) * tw
        var h = 0
        for (a in 0 until 4) {
            for (b in 0 until 4) {
                val c = joined[i + a + b * tw]
                h += c.r() * 256 + c.g()
            }
        }
        h /= 16
        rgba(h.shr(8).and(255), h.and(255), 0, 255)
    }
    ImageWriter.writeRGBImageInt(tw / 8, th / 8, "result375", 16) { x, y, _ ->
        val i = (x * 8) + (y * 8) * tw
        var h = 0
        for (a in 0 until 8) {
            for (b in 0 until 8) {
                val c = joined[i + a + b * tw]
                h += c.r() * 256 + c.g()
            }
        }
        h /= 64
        rgba(h.shr(8).and(255), h.and(255), 0, 255)
    }
}