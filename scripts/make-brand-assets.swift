import AppKit
import Foundation

guard CommandLine.arguments.count == 3 else {
  fputs("Usage: make-brand-assets.swift <source.png> <output-directory>\n", stderr)
  exit(2)
}

let sourceURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
guard let source = NSImage(contentsOf: sourceURL) else {
  fputs("Could not read source logo.\n", stderr)
  exit(1)
}

try FileManager.default.createDirectory(at: outputURL, withIntermediateDirectories: true)
try FileManager.default.copyItemReplacing(sourceURL, outputURL.appendingPathComponent("moodify-logo.png"))

func render(name: String, pixels: Int, markFraction: CGFloat, background: NSColor?) throws {
  guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: pixels,
    pixelsHigh: pixels,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
  ) else { throw NSError(domain: "MoodifyBrand", code: 1) }

  bitmap.size = NSSize(width: pixels, height: pixels)
  guard let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
    throw NSError(domain: "MoodifyBrand", code: 3)
  }
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = context
  let canvas = NSRect(x: 0, y: 0, width: pixels, height: pixels)
  NSColor.clear.setFill()
  canvas.fill()
  if let background {
    background.setFill()
    canvas.fill()
  }
  let markSize = CGFloat(pixels) * markFraction
  let sourceRatio = source.size.width / source.size.height
  let drawWidth = markSize * sourceRatio
  let rect = NSRect(
    x: (CGFloat(pixels) - drawWidth) / 2,
    y: (CGFloat(pixels) - markSize) / 2,
    width: drawWidth,
    height: markSize
  )
  source.draw(in: rect, from: .zero, operation: .sourceOver, fraction: 1)
  context.flushGraphics()
  NSGraphicsContext.restoreGraphicsState()
  guard let data = bitmap.representation(using: .png, properties: [:]) else {
    throw NSError(domain: "MoodifyBrand", code: 2)
  }
  try data.write(to: outputURL.appendingPathComponent(name), options: .atomic)
}

try render(name: "moodify-app-icon.png", pixels: 1024, markFraction: 0.78, background: .black)
try render(name: "moodify-adaptive-foreground.png", pixels: 1024, markFraction: 0.60, background: nil)
try render(name: "moodify-splash-logo.png", pixels: 512, markFraction: 0.82, background: nil)
try render(name: "moodify-favicon.png", pixels: 192, markFraction: 0.84, background: .black)

print("Created deterministic brand assets from \(sourceURL.lastPathComponent).")

private extension FileManager {
  func copyItemReplacing(_ source: URL, _ destination: URL) throws {
    if fileExists(atPath: destination.path) { try removeItem(at: destination) }
    try copyItem(at: source, to: destination)
  }
}
