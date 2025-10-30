import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CornerPathEffect, ImageFormat, Skia } from '@shopify/react-native-skia';
import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FreeCanvas from 'react-native-free-canvas';
import { runOnJS } from 'react-native-reanimated';

export default function DrawingScreen() {
  const canvasRef = useRef<any>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [strokeCount, setStrokeCount] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(1.0);
  const [strokeColor, setStrokeColor] = useState<string>(colors.tint);
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [mode, setMode] = useState<'draw' | 'rect' | 'square' | 'circle'>('draw');
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeCurrent, setShapeCurrent] = useState<{ x: number; y: number } | null>(null);

  // Make lines smoother
  const pathEffect = useMemo(() => <CornerPathEffect r={32} />, []);

  const palette = useMemo(
    () => [
      colors.tint,
      '#000000',
      '#ff3b30',
      '#ff9500',
      '#ffcc00',
      '#34c759',
      '#007aff',
      '#af52de',
      '#ff2d55',
      '#ffffff',
    ],
    [colors.tint]
  );

  const handleUndo = () => {
    canvasRef.current?.undo();
    setStrokeCount(prev => Math.max(0, prev - 1));
  };

  const handleReset = () => {
    canvasRef.current?.reset();
    setStrokeCount(0);
  };

  const handleSave = async () => {
    // Use ImageFormat enum; passing a string causes a native type error
    const base64 = await canvasRef.current?.toBase64(ImageFormat.PNG, 100);
    if (base64) {
      console.log('Canvas saved as base64:', base64.substring(0, 50) + '...');
      // You can implement save functionality here
    }
  };

  const handleDrawEnd = () => {
    setStrokeCount(prev => prev + 1);
  };

  const handleScale = (scale: number) => {
    'worklet';
    runOnJS(setCurrentZoom)(scale);
  };

  const handleResetZoom = () => {
    canvasRef.current?.resetZoom(300);
  };

  const handleSelectColor = (c: string) => {
    setStrokeColor(c);
  };

  const handleSelectWidth = (w: number) => {
    setStrokeWidth(w);
  };

  // Helpers to compute geometry
  const getNormalizedRect = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const w = Math.abs(a.x - b.x);
    const h = Math.abs(a.y - b.y);
    return { x, y, w, h };
  };

  const getSquareFromPoints = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const size = Math.max(Math.abs(dx), Math.abs(dy));
    const x = a.x + (dx < 0 ? -size : 0);
    const y = a.y + (dy < 0 ? -size : 0);
    return { x: Math.min(x, a.x), y: Math.min(y, a.y), w: size, h: size };
  };

  const commitShape = () => {
    if (!shapeStart || !shapeCurrent || mode === 'draw') return;
    const path = Skia.Path.Make();
    if (mode === 'circle') {
      const { x, y, w, h } = getNormalizedRect(shapeStart, shapeCurrent);
      const r = Math.min(w, h) / 2;
      const cx = x + Math.min(w, h) / 2 + (w > h ? (w - h) / 2 : 0);
      const cy = y + Math.min(w, h) / 2 + (h > w ? (h - w) / 2 : 0);
      path.addCircle(cx, cy, r);
    } else if (mode === 'square') {
      const { x, y, w, h } = getSquareFromPoints(shapeStart, shapeCurrent);
      path.addRect(Skia.XYWHRect(x, y, w, h));
    } else if (mode === 'rect') {
      const { x, y, w, h } = getNormalizedRect(shapeStart, shapeCurrent);
      path.addRect(Skia.XYWHRect(x, y, w, h));
    }
    const svg = path.toSVGString();
    const prev = canvasRef.current?.toPaths?.() ?? [];
    canvasRef.current?.drawPaths?.([
      ...prev,
      {
        key: `shape-${Date.now()}`,
        strokeWidth,
        strokeColor,
        path: svg,
      },
    ]);
    setShapeStart(null);
    setShapeCurrent(null);
  };

  const onShapeGrant = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    setShapeStart({ x: locationX, y: locationY });
    setShapeCurrent({ x: locationX, y: locationY });
  };

  const onShapeMove = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    if (shapeStart) setShapeCurrent({ x: locationX, y: locationY });
  };

  const onShapeEnd = () => {
    commitShape();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>🎨 Free Drawing Canvas</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Draw, zoom, and pan freely - infinite canvas
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={[styles.infoBadge, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Strokes:</Text>
          <Text style={[styles.infoValue, { color: colors.tint }]}>{strokeCount}</Text>
        </View>
        <View style={[styles.infoBadge, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Zoom:</Text>
          <Text style={[styles.infoValue, { color: colors.tint }]}>{currentZoom.toFixed(1)}x</Text>
        </View>
        <View style={[styles.infoBadge, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}>
          <Text style={[styles.infoLabel, { color: colors.text }]}>Width:</Text>
          <Text style={[styles.infoValue, { color: colors.tint }]}>{strokeWidth}px</Text>
        </View>
        <TouchableOpacity 
          style={[styles.infoBadge, styles.resetButton, { backgroundColor: colors.tint, borderColor: colors.tint }]}
          onPress={handleResetZoom}
        >
          <Text style={[styles.infoLabel, { color: '#fff' }]}>Reset View</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlsContainer}>
        <Text style={[styles.controlLabel, { color: colors.text }]}>Color</Text>
        <View style={styles.paletteRow}>
          {palette.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => handleSelectColor(c)}
              style={[
                styles.swatch,
                { backgroundColor: c, borderColor: colors.tint },
                strokeColor === c && styles.swatchSelected,
              ]}
            />
          ))}
        </View>

        <Text style={[styles.controlLabel, { color: colors.text, marginTop: 12 }]}>Width</Text>
        <View style={styles.widthRow}>
          {[2, 3, 5, 8, 12, 16, 24].map((w) => (
            <TouchableOpacity
              key={w}
              onPress={() => handleSelectWidth(w)}
              style={[
                styles.widthChip,
                { borderColor: colors.tint },
                strokeWidth === w && styles.widthChipSelected,
              ]}
            >
              <View
                style={{
                  height: w,
                  width: 28,
                  backgroundColor: strokeColor,
                  borderRadius: w / 2,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.controlLabel, { color: colors.text, marginTop: 12 }]}>Mode</Text>
        <View style={styles.modeRow}>
          {([
            { key: 'draw', label: 'Free' },
            { key: 'rect', label: 'Rect' },
            { key: 'square', label: 'Square' },
            { key: 'circle', label: 'Circle' },
          ] as const).map((m) => (
            <TouchableOpacity
              key={m.key}
              onPress={() => setMode(m.key)}
              style={[
                styles.modeChip,
                { borderColor: colors.tint },
                mode === m.key && styles.modeChipSelected,
              ]}
            >
              <Text style={[styles.modeChipText, { color: mode === m.key ? '#fff' : colors.text }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={[styles.canvasContainer, { 
        borderColor: colors.tint,
        backgroundColor: colorScheme === 'dark' ? '#0a0a0a' : '#f5f5f5',
      }]}>
        <View style={[styles.canvasBorder, { borderColor: colors.tint }]}>
          <FreeCanvas
            ref={canvasRef}
            style={styles.canvas}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            backgroundColor={colorScheme === 'dark' ? '#1a1a1a' : '#ffffff'}
            pathEffect={pathEffect}
            zoomable={mode === 'draw'}
            zoomRange={[0.5, 5]}
            onDrawEnd={handleDrawEnd}
            onScale={handleScale}
          />
          {/* Shape drawing overlay */}
          {mode !== 'draw' && (
            <View
              pointerEvents="auto"
              style={StyleSheet.absoluteFill}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={onShapeGrant}
              onResponderMove={onShapeMove}
              onResponderRelease={onShapeEnd}
            >
              {/* Preview */}
              {shapeStart && shapeCurrent && (
                mode === 'circle' ? (
                  (() => {
                    const { x, y, w, h } = getNormalizedRect(shapeStart, shapeCurrent);
                    const d = Math.min(w, h);
                    const left = x + (w - d) / 2;
                    const top = y + (h - d) / 2;
                    return (
                      <View
                        style={{
                          position: 'absolute',
                          left,
                          top,
                          width: d,
                          height: d,
                          borderRadius: d / 2,
                          borderWidth: 1,
                          borderStyle: 'dashed',
                          borderColor: colors.tint,
                          backgroundColor: 'transparent',
                        }}
                      />
                    );
                  })()
                ) : (
                  (() => {
                    const rect = mode === 'square' ? getSquareFromPoints(shapeStart, shapeCurrent) : getNormalizedRect(shapeStart, shapeCurrent);
                    return (
                      <View
                        style={{
                          position: 'absolute',
                          left: rect.x,
                          top: rect.y,
                          width: rect.w,
                          height: rect.h,
                          borderWidth: 1,
                          borderStyle: 'dashed',
                          borderColor: colors.tint,
                          backgroundColor: 'transparent',
                        }}
                      />
                    );
                  })()
                )
              )}
            </View>
          )}
        </View>
        <Text style={[styles.canvasLabel, { color: colors.text }]}>
          ✨ Draw • 🤏 Pinch to zoom • ✌️ Two fingers to pan
        </Text>
      </View>

      <View style={[styles.toolbar, { backgroundColor: colors.background, borderTopColor: colors.tint }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={handleUndo}
        >
          <Text style={styles.buttonText}>↶ Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>🗑️ Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>💾 Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  resetButton: {
    paddingHorizontal: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  canvasContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  canvasBorder: {
    flex: 1,
    borderWidth: 3,
    borderRadius: 12,
    overflow: 'hidden',
    borderStyle: 'dashed',
    position: 'relative',
  },
  canvas: {
    flex: 1,
  },
  canvasLabel: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
    opacity: 0.6,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 2,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 6,
  },
  controlLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  swatchSelected: {
    borderWidth: 3,
  },
  widthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  widthChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  widthChipSelected: {
    backgroundColor: '#00000010',
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeChip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  modeChipSelected: {
    backgroundColor: '#007aff',
  },
  modeChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 90,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
