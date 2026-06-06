import { useMemo, useState } from "react"
import { Image, Pressable, ScrollView, Text, View } from "react-native"

import {
  Runtime,
  ScopedTheme,
  StyleSheet,
  alpha,
  contrastColor,
  createVariant,
  darken,
  imageStyle,
  isLight,
  lighten,
  mix,
  parseColor,
  responsive,
  textStyle,
  toHex,
  useRuntime,
  useStyles,
  useTheme,
  viewStyle,
  withOpacity,
  type StyleVariants
} from "@dripstyle/core"

const BRAND_MARK = require("../assets/images/icon.png")

type LookStatus = "ready" | "review" | "washing"
type LookTone = "primary" | "secondary" | "accent"
type OutfitSlot = "outerwear" | "top" | "bottom" | "shoe"

type Look = {
  id: string
  title: string
  context: string
  time: string
  status: LookStatus
  tone: LookTone
  confidence: number
  weather: string
  colors: readonly string[]
  slots: readonly { slot: OutfitSlot; label: string; color: string }[]
}

type InventoryItem = {
  id: string
  name: string
  category: string
  status: LookStatus
  wears: number
  color: string
}

const LOOKS: readonly Look[] = [
  {
    id: "client-review",
    title: "Client review",
    context: "Office, rain shell, 18 C",
    time: "09:30",
    status: "ready",
    tone: "primary",
    confidence: 92,
    weather: "Rain later",
    colors: ["rgb(24, 24, 27)", "rgb(226, 232, 240)", "rgb(20, 184, 166)"],
    slots: [
      { slot: "outerwear", label: "Waxed jacket", color: "rgb(39, 39, 42)" },
      { slot: "top", label: "Fine knit", color: "rgb(226, 232, 240)" },
      { slot: "bottom", label: "Pleated trouser", color: "rgb(63, 63, 70)" },
      { slot: "shoe", label: "Derby", color: "rgb(24, 24, 27)" }
    ]
  },
  {
    id: "studio-day",
    title: "Studio day",
    context: "Hands-on session, 21 C",
    time: "13:00",
    status: "review",
    tone: "accent",
    confidence: 76,
    weather: "Dry",
    colors: ["rgb(180, 83, 9)", "rgb(250, 204, 21)", "rgb(15, 23, 42)"],
    slots: [
      { slot: "outerwear", label: "Canvas overshirt", color: "rgb(180, 83, 9)" },
      { slot: "top", label: "Ribbed tee", color: "rgb(250, 250, 250)" },
      { slot: "bottom", label: "Wide denim", color: "rgb(30, 41, 59)" },
      { slot: "shoe", label: "Runner", color: "rgb(250, 204, 21)" }
    ]
  },
  {
    id: "dinner",
    title: "Dinner booking",
    context: "Low light, polished layer",
    time: "20:15",
    status: "washing",
    tone: "secondary",
    confidence: 64,
    weather: "Wind",
    colors: ["rgb(88, 28, 135)", "rgb(244, 114, 182)", "rgb(31, 41, 55)"],
    slots: [
      { slot: "outerwear", label: "Cropped blazer", color: "rgb(88, 28, 135)" },
      { slot: "top", label: "Silk shell", color: "rgb(244, 114, 182)" },
      { slot: "bottom", label: "Straight skirt", color: "rgb(31, 41, 55)" },
      { slot: "shoe", label: "Slingback", color: "rgb(17, 24, 39)" }
    ]
  }
]

const INVENTORY: readonly InventoryItem[] = [
  {
    id: "linen-shirt",
    name: "Linen shirt",
    category: "Tops",
    status: "ready",
    wears: 14,
    color: "rgb(226, 232, 240)"
  },
  {
    id: "wide-denim",
    name: "Wide denim",
    category: "Bottoms",
    status: "ready",
    wears: 22,
    color: "rgb(30, 41, 59)"
  },
  {
    id: "silk-shell",
    name: "Silk shell",
    category: "Tops",
    status: "washing",
    wears: 7,
    color: "rgb(244, 114, 182)"
  },
  {
    id: "waxed-jacket",
    name: "Waxed jacket",
    category: "Outerwear",
    status: "review",
    wears: 31,
    color: "rgb(39, 39, 42)"
  }
]

const staticStylesheet = StyleSheet.create({
  brandMark: imageStyle({
    width: 38,
    height: 38,
    borderRadius: 10
  }),
  thumbnail: imageStyle({
    width: 46,
    height: 46,
    borderRadius: 12
  })
})

const stylesheet = StyleSheet.create(({ theme, runtime }) => {
  const pagePadding =
    responsive(
      { xs: theme.space(4), md: theme.space(6), lg: theme.space(8) },
      runtime.breakpoint
    ) ?? theme.space(4)
  const maxContentWidth = responsive({ lg: 1180 }, runtime.breakpoint)
  const panelGap =
    responsive(
      { xs: theme.space(3), md: theme.space(4), lg: theme.space(5) },
      runtime.breakpoint
    ) ?? theme.space(3)
  const isWide = runtime.window.width >= 820
  const isDesktop = runtime.window.width >= 1080
  const lowContrastBorder = isLight(theme.colors.background)
    ? darken(theme.colors.border, 0.08)
    : lighten(theme.colors.border, 0.12)
  const chartRgb = parseColor(theme.colors.chart2)
  const chartTint = withOpacity(theme.colors.chart2, Math.max(0.12, chartRgb.a * 0.16))
  const surfaceTint = mix(theme.colors.card, theme.colors.chart2, 0.88)
  const translucentCard = alpha(theme.colors.card, 0.94)

  return {
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    content: viewStyle({
      alignSelf: "center",
      gap: theme.space(5),
      maxWidth: maxContentWidth,
      paddingBottom: runtime.insets.bottom + theme.space(8),
      paddingHorizontal: pagePadding,
      paddingTop: theme.space(5),
      width: "100%"
    }),
    header: viewStyle({
      alignItems: isWide ? "center" : "flex-start",
      flexDirection: isWide ? "row" : "column",
      gap: theme.space(4),
      justifyContent: "space-between"
    }),
    brandCluster: viewStyle({
      alignItems: "center",
      flexDirection: "row",
      gap: theme.space(3)
    }),
    eyebrow: textStyle({
      color: theme.colors.mutedForeground,
      fontSize: theme.fontSize("xs"),
      fontWeight: theme.fontWeight("bold"),
      textTransform: "uppercase"
    }),
    title: textStyle({
      color: theme.colors.foreground,
      fontSize: isWide ? theme.fontSize("4xl") : theme.fontSize("3xl"),
      fontWeight: theme.fontWeight("black"),
      lineHeight: isWide ? theme.lineHeight(10) : theme.lineHeight(9)
    }),
    subtitle: textStyle({
      color: theme.colors.mutedForeground,
      fontSize: theme.fontSize("sm"),
      lineHeight: theme.lineHeight(5),
      maxWidth: 620
    }),
    toolbar: viewStyle({
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.space(2)
    }),
    actionButton: createVariant({
      base: {
        alignItems: "center",
        borderRadius: theme.radius("lg"),
        borderWidth: theme.borderWidth("base"),
        flexDirection: "row",
        justifyContent: "center"
      },
      variants: {
        intent: {
          primary: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary
          },
          secondary: {
            backgroundColor: theme.colors.secondary,
            borderColor: theme.colors.border
          },
          quiet: {
            backgroundColor: "transparent",
            borderColor: theme.colors.border
          }
        },
        size: {
          sm: { minHeight: 34, paddingHorizontal: theme.space(3) },
          md: { minHeight: 42, paddingHorizontal: theme.space(4) }
        },
        selected: {
          true: {},
          false: {}
        }
      },
      compoundVariants: [
        {
          intent: "quiet",
          selected: "true",
          style: {
            backgroundColor: theme.colors.accent,
            borderColor: theme.colors.ring
          }
        }
      ],
      defaultVariants: { intent: "secondary", size: "md", selected: false }
    }),
    actionText: createVariant({
      base: {
        fontSize: theme.fontSize("sm"),
        fontWeight: theme.fontWeight("bold")
      },
      variants: {
        intent: {
          primary: { color: theme.colors.primaryForeground },
          secondary: { color: theme.colors.secondaryForeground },
          quiet: { color: theme.colors.foreground }
        },
        selected: {
          true: { color: theme.colors.accentForeground },
          false: {}
        }
      },
      defaultVariants: { intent: "secondary", selected: false }
    }),
    hero: viewStyle({
      backgroundColor: translucentCard,
      borderColor: lowContrastBorder,
      borderRadius: theme.radius("2xl"),
      borderWidth: theme.borderWidth("base"),
      gap: theme.space(4),
      overflow: "hidden",
      padding: isWide ? theme.space(5) : theme.space(4),
      ...theme.shadow(isLight(theme.colors.background) ? "sm" : "none")
    }),
    heroTop: {
      flexDirection: isWide ? "row" : "column",
      gap: theme.space(4)
    },
    heroCopy: {
      flex: 1,
      gap: theme.space(3)
    },
    scorePanel: viewStyle({
      backgroundColor: chartTint,
      borderColor: withOpacity(theme.colors.chart2, 0.32),
      borderRadius: theme.radius("xl"),
      borderWidth: theme.borderWidth("base"),
      gap: theme.space(3),
      minWidth: isWide ? 260 : undefined,
      padding: theme.space(4)
    }),
    metricRow: viewStyle({
      flexDirection: "row",
      gap: theme.space(3)
    }),
    metric: {
      flex: 1,
      gap: theme.space(1)
    },
    metricValue: textStyle({
      color: theme.colors.foreground,
      fontSize: theme.fontSize("2xl"),
      fontWeight: theme.fontWeight("black")
    }),
    metricLabel: textStyle({
      color: theme.colors.mutedForeground,
      fontSize: theme.fontSize("xs"),
      fontWeight: theme.fontWeight("medium")
    }),
    grid: {
      flexDirection: isWide ? "row" : "column",
      flexWrap: "wrap",
      gap: panelGap
    },
    panel: (span: "full" | "half" | "third") =>
      viewStyle({
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius("2xl"),
        borderWidth: theme.borderWidth("base"),
        gap: theme.space(4),
        padding: theme.space(4),
        width: !isWide
          ? "100%"
          : isDesktop && span === "third"
            ? "31.7%"
            : span === "full"
              ? "100%"
              : "48.5%"
      }),
    panelHeader: viewStyle({
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between"
    }),
    sectionTitle: textStyle({
      color: theme.colors.foreground,
      fontSize: theme.fontSize("lg"),
      fontWeight: theme.fontWeight("extrabold")
    }),
    mutedText: textStyle({
      color: theme.colors.mutedForeground,
      fontSize: theme.fontSize("sm"),
      lineHeight: theme.lineHeight(5)
    }),
    lookList: {
      gap: theme.space(3)
    },
    lookCard: createVariant({
      base: {
        borderRadius: theme.radius("xl"),
        borderWidth: theme.borderWidth("base"),
        gap: theme.space(3),
        padding: theme.space(3)
      },
      variants: {
        tone: {
          primary: {
            backgroundColor: mix(theme.colors.card, theme.colors.chart2, 0.86),
            borderColor: withOpacity(theme.colors.chart2, 0.34)
          },
          secondary: {
            backgroundColor: theme.colors.secondary,
            borderColor: theme.colors.border
          },
          accent: {
            backgroundColor: surfaceTint,
            borderColor: withOpacity(theme.colors.chart1, 0.34)
          }
        },
        selected: {
          true: {
            borderColor: theme.colors.ring,
            transform: [{ scale: 1.01 }]
          },
          false: {}
        }
      },
      defaultVariants: { tone: "secondary", selected: false }
    }),
    lookTop: viewStyle({
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between"
    }),
    lookTitle: textStyle({
      color: theme.colors.foreground,
      fontSize: theme.fontSize("base"),
      fontWeight: theme.fontWeight("bold")
    }),
    timeText: textStyle({
      color: theme.colors.mutedForeground,
      fontSize: theme.fontSize("xs"),
      fontWeight: theme.fontWeight("bold")
    }),
    statusBadge: createVariant({
      base: {
        alignSelf: "flex-start",
        borderRadius: theme.radius("full"),
        borderWidth: theme.borderWidth("base"),
        paddingHorizontal: theme.space(2.5),
        paddingVertical: theme.space(1)
      },
      variants: {
        status: {
          ready: {
            backgroundColor: withOpacity(theme.colors.success, 0.13),
            borderColor: theme.colors.successBorder
          },
          review: {
            backgroundColor: withOpacity(theme.colors.warning, 0.15),
            borderColor: theme.colors.warningBorder
          },
          washing: {
            backgroundColor: withOpacity(theme.colors.info, 0.14),
            borderColor: theme.colors.infoBorder
          }
        },
        compact: {
          true: { paddingHorizontal: theme.space(2), paddingVertical: theme.space(0.5) },
          false: {}
        }
      },
      defaultVariants: { status: "ready", compact: false }
    }),
    statusText: createVariant({
      base: {
        fontSize: theme.fontSize("xs"),
        fontWeight: theme.fontWeight("bold"),
        textTransform: "uppercase"
      },
      variants: {
        status: {
          ready: { color: theme.colors.success },
          review: { color: theme.colors.warning },
          washing: { color: theme.colors.info }
        }
      },
      defaultVariants: { status: "ready" }
    }),
    progressTrack: {
      backgroundColor: theme.colors.muted,
      borderRadius: theme.radius("full"),
      height: 8,
      overflow: "hidden"
    },
    progressFill: (value: number, color: string) =>
      viewStyle({
        backgroundColor: color,
        borderRadius: theme.radius("full"),
        height: "100%",
        width: `${Math.max(4, Math.min(100, value))}%`
      }),
    swatchRow: viewStyle({
      flexDirection: "row",
      gap: theme.space(2)
    }),
    swatch: (color: string, selected: boolean) =>
      viewStyle({
        alignItems: "center",
        backgroundColor: color,
        borderColor: selected
          ? theme.colors.foreground
          : isLight(color)
            ? darken(color, 0.16)
            : lighten(color, 0.18),
        borderRadius: theme.radius("lg"),
        borderWidth: selected ? theme.borderWidth("md") : theme.borderWidth("base"),
        height: 34,
        justifyContent: "center",
        width: 42
      }),
    swatchText: (color: string) =>
      textStyle({
        color: contrastColor(color),
        fontSize: 10,
        fontWeight: theme.fontWeight("black")
      }),
    mirror: viewStyle({
      backgroundColor: theme.colors.card,
      borderColor: withOpacity(theme.colors.border, 0.78),
      borderRadius: theme.radius("2xl"),
      borderWidth: theme.borderWidth("base"),
      gap: theme.space(4),
      overflow: "hidden",
      padding: theme.space(4)
    }),
    mirrorStage: {
      alignItems: "center",
      backgroundColor: withOpacity(theme.colors.background, 0.54),
      borderColor: theme.colors.border,
      borderRadius: theme.radius("xl"),
      borderWidth: theme.borderWidth("base"),
      gap: theme.space(2),
      minHeight: 260,
      padding: theme.space(4)
    },
    slotWrap: viewStyle({
      alignItems: "center",
      gap: theme.space(1.5)
    }),
    slot: (slot: OutfitSlot, color: string) =>
      viewStyle({
        backgroundColor: color,
        borderColor: isLight(color) ? darken(color, 0.22) : lighten(color, 0.22),
        borderRadius: slot === "shoe" ? theme.radius("full") : theme.radius("lg"),
        borderWidth: theme.borderWidth("base"),
        height: slot === "outerwear" ? 78 : slot === "top" ? 62 : slot === "bottom" ? 86 : 24,
        width: slot === "outerwear" ? 156 : slot === "top" ? 124 : slot === "bottom" ? 112 : 132
      }),
    slotLabel: textStyle({
      color: theme.colors.mutedForeground,
      fontSize: theme.fontSize("xs"),
      fontWeight: theme.fontWeight("medium")
    }),
    inventoryList: {
      gap: theme.space(2)
    },
    inventoryRow: viewStyle({
      alignItems: "center",
      flexDirection: "row",
      gap: theme.space(3),
      justifyContent: "space-between"
    }),
    inventoryMeta: {
      flex: 1,
      gap: theme.space(0.5)
    },
    inventoryName: textStyle({
      color: theme.colors.foreground,
      fontSize: theme.fontSize("sm"),
      fontWeight: theme.fontWeight("bold")
    }),
    colorThumb: (color: string) =>
      viewStyle({
        backgroundColor: color,
        borderColor: isLight(color) ? darken(color, 0.18) : lighten(color, 0.2),
        borderRadius: theme.radius("lg"),
        borderWidth: theme.borderWidth("base"),
        height: 38,
        width: 38
      }),
    paletteGrid: viewStyle({
      flexDirection: "row",
      flexWrap: "wrap",
      gap: theme.space(2)
    }),
    paletteCard: (color: string) =>
      viewStyle({
        backgroundColor: color,
        borderColor: isLight(color) ? darken(color, 0.14) : lighten(color, 0.16),
        borderRadius: theme.radius("lg"),
        borderWidth: theme.borderWidth("base"),
        minWidth: 98,
        padding: theme.space(3)
      }),
    paletteName: (color: string) =>
      textStyle({
        color: contrastColor(color),
        fontSize: theme.fontSize("xs"),
        fontWeight: theme.fontWeight("bold")
      }),
    paletteValue: (color: string) =>
      textStyle({
        color: withOpacity(contrastColor(color), 0.72),
        fontSize: 10,
        marginTop: theme.space(1)
      }),
    themeSignalPanel: viewStyle({
      borderRadius: theme.radius("xl"),
      borderWidth: theme.borderWidth("base"),
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.ring,
      gap: theme.space(2),
      padding: theme.space(3)
    }),
    runtimeLine: textStyle({
      color: theme.colors.mutedForeground,
      fontSize: theme.fontSize("xs"),
      lineHeight: theme.lineHeight(4)
    })
  }
})

type ActionButtonVariants = StyleVariants<typeof stylesheet, "actionButton">
type ActionButtonProps = ActionButtonVariants & {
  label: string
  onPress?: () => void
}

function ActionButton({
  intent = "secondary",
  label,
  onPress,
  selected = false,
  size = "md"
}: ActionButtonProps) {
  const styles = useStyles(stylesheet)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.actionButton({ intent, selected, size })}
    >
      <Text style={styles.actionText({ intent, selected })}>{label}</Text>
    </Pressable>
  )
}

function StatusPill({ status, compact = false }: { status: LookStatus; compact?: boolean }) {
  const styles = useStyles(stylesheet)
  const label = status === "ready" ? "Ready" : status === "review" ? "Review" : "Laundry"

  return (
    <View style={styles.statusBadge({ compact, status })}>
      <Text style={styles.statusText({ status })}>{label}</Text>
    </View>
  )
}

function LookCard({
  look,
  onPress,
  selected
}: {
  look: Look
  onPress: () => void
  selected: boolean
}) {
  const styles = useStyles(stylesheet)

  return (
    <Pressable onPress={onPress} style={styles.lookCard({ selected, tone: look.tone })}>
      <View style={styles.lookTop}>
        <View>
          <Text style={styles.lookTitle}>{look.title}</Text>
          <Text style={styles.mutedText}>{look.context}</Text>
        </View>
        <Text style={styles.timeText}>{look.time}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={styles.progressFill(look.confidence, look.colors[2] ?? look.colors[0])} />
      </View>
      <View style={styles.lookTop}>
        <StatusPill compact status={look.status} />
        <Text style={styles.timeText}>{look.confidence}% match</Text>
      </View>
      <View style={styles.swatchRow}>
        {look.colors.map((color) => (
          <View key={color} style={styles.swatch(color, selected)}>
            <Text style={styles.swatchText(color)}>Aa</Text>
          </View>
        ))}
      </View>
    </Pressable>
  )
}

function MirrorPreview({ look }: { look: Look }) {
  const styles = useStyles(stylesheet)

  return (
    <View style={styles.mirror}>
      <View style={styles.panelHeader}>
        <View>
          <Text style={styles.sectionTitle}>{look.title}</Text>
          <Text style={styles.mutedText}>{look.weather}</Text>
        </View>
        <StatusPill status={look.status} />
      </View>
      <View style={styles.mirrorStage}>
        {look.slots.map((item) => (
          <View key={item.slot} style={styles.slotWrap}>
            <View style={styles.slot(item.slot, item.color)} />
            <Text style={styles.slotLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function ThemeSignalPanel() {
  const styles = useStyles(stylesheet)
  const { themeName } = useTheme()

  return (
    <View style={styles.themeSignalPanel}>
      <Text style={styles.sectionTitle}>Client room</Text>
      <Text style={styles.mutedText}>
        A theme-aware signal panel rendered from the active {themeName} theme.
      </Text>
    </View>
  )
}

export default function ShowcaseScreen() {
  const [selectedLookId, setSelectedLookId] = useState(LOOKS[0]!.id)
  const styles = useStyles(stylesheet)
  const staticStyles = useStyles(staticStylesheet)
  const runtime = useRuntime()
  const { colorScheme, hasAdaptiveThemes, setAdaptiveThemes, setTheme, theme, themeName } =
    useTheme()

  const selectedLook = LOOKS.find((look) => look.id === selectedLookId) ?? LOOKS[0]!
  const palette = useMemo(
    () => [
      { label: "Core", color: theme.colors.primary },
      { label: "Signal", color: theme.colors.chart2 },
      { label: "Warmth", color: theme.colors.chart1 },
      { label: "Risk", color: theme.colors.warning }
    ],
    [theme.colors.chart1, theme.colors.chart2, theme.colors.primary, theme.colors.warning]
  )

  const switchTheme = () => {
    setAdaptiveThemes(false)
    setTheme(themeName === "dark" ? "light" : "dark")
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      style={styles.screen}
    >
      <View style={styles.header}>
        <View style={styles.brandCluster}>
          <Image source={BRAND_MARK} style={staticStyles.brandMark} />
          <View>
            <Text style={styles.eyebrow}>Dripstyle Studio</Text>
            <Text style={styles.title}>Daily wardrobe desk</Text>
          </View>
        </View>
        <View style={styles.toolbar}>
          <ActionButton
            intent="quiet"
            label={themeName === "dark" ? "Light" : "Dark"}
            onPress={switchTheme}
            selected={!hasAdaptiveThemes}
            size="sm"
          />
          <ActionButton
            intent="secondary"
            label="Auto"
            onPress={() => setAdaptiveThemes(true)}
            selected={hasAdaptiveThemes}
            size="sm"
          />
          <ActionButton intent="primary" label="Publish plan" size="sm" />
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={styles.subtitle}>
              Review the day&apos;s looks, swap pieces before they leave rotation, and keep the
              client plan aligned with weather and garment care.
            </Text>
            <View style={styles.metricRow}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>3</Text>
                <Text style={styles.metricLabel}>Looks queued</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>74%</Text>
                <Text style={styles.metricLabel}>Rotation health</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{runtime.breakpoint}</Text>
                <Text style={styles.metricLabel}>Layout band</Text>
              </View>
            </View>
          </View>
          <View style={styles.scorePanel}>
            <Text style={styles.sectionTitle}>Today</Text>
            <Text style={styles.mutedText}>
              {selectedLook.title} is scheduled for {selectedLook.time}. Device mode is{" "}
              {colorScheme ?? "unknown"} on {Runtime.platform}.
            </Text>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill(selectedLook.confidence, selectedLook.colors[2])} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        <View style={styles.panel("half")}>
          <View style={styles.panelHeader}>
            <Text style={styles.sectionTitle}>Calendar</Text>
            <Text style={styles.timeText}>{LOOKS.length} slots</Text>
          </View>
          <View style={styles.lookList}>
            {LOOKS.map((look) => (
              <LookCard
                key={look.id}
                look={look}
                onPress={() => setSelectedLookId(look.id)}
                selected={look.id === selectedLookId}
              />
            ))}
          </View>
        </View>

        <View style={styles.panel("half")}>
          <View style={styles.panelHeader}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <Text style={styles.timeText}>Private room</Text>
          </View>
          <ScopedTheme theme="dark">
            <MirrorPreview look={selectedLook} />
          </ScopedTheme>
        </View>

        <View style={styles.panel("third")}>
          <View style={styles.panelHeader}>
            <Text style={styles.sectionTitle}>Inventory</Text>
            <StatusPill compact status="review" />
          </View>
          <View style={styles.inventoryList}>
            {INVENTORY.map((item) => (
              <View key={item.id} style={styles.inventoryRow}>
                <View style={styles.colorThumb(item.color)} />
                <View style={styles.inventoryMeta}>
                  <Text style={styles.inventoryName}>{item.name}</Text>
                  <Text style={styles.mutedText}>
                    {item.category}, {item.wears} wears
                  </Text>
                </View>
                <StatusPill compact status={item.status} />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.panel("third")}>
          <View style={styles.panelHeader}>
            <Text style={styles.sectionTitle}>Palette</Text>
            <Image source={BRAND_MARK} style={staticStyles.thumbnail} />
          </View>
          <View style={styles.paletteGrid}>
            {palette.map((item) => (
              <View key={item.label} style={styles.paletteCard(item.color)}>
                <Text style={styles.paletteName(item.color)}>{item.label}</Text>
                <Text style={styles.paletteValue(item.color)}>{toHex(item.color)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.panel("third")}>
          <ThemeSignalPanel />
          <Text style={styles.runtimeLine}>
            Window {Math.round(runtime.window.width)} x {Math.round(runtime.window.height)}. Font
            scale {runtime.fontScale.toFixed(2)}. Reduce motion{" "}
            {runtime.reduceMotion ? "on" : "off"}.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
