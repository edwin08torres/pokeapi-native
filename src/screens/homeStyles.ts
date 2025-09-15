import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
    },
    searchPill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(10,10,10,0.35)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 16,
        paddingHorizontal: 12,
        height: 48,
    },
    sectionTitle: {
        color: "#9CA3AF",
        fontWeight: "800",
        marginBottom: 10,
        letterSpacing: 0.3,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginBottom: 8,
    },
    genCard: { width: "48%", borderRadius: 16, overflow: "hidden" },
    genCardInner: {
        paddingVertical: 14,
        paddingHorizontal: 12,
        minHeight: 110,
        justifyContent: "space-between",
        borderRadius: 16,
    },
    genTitle: { color: "#fff", fontWeight: "900", letterSpacing: 0.5 },
    startersRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "flex-end",
    },
    starterImg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.25)",
    },
    segmented: { flexDirection: "row", gap: 8, marginTop: 4, marginBottom: 12 },
    segmentBtn: {
        flex: 1,
        backgroundColor: "#111",
        borderWidth: 1,
        borderColor: "#1f2937",
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: "center",
    },
    segmentText: { color: "#fff", fontWeight: "800" },
    cta: { marginTop: 6, backgroundColor: "#7c3aed", paddingVertical: 14, borderRadius: 14 },
    ctaText: { color: "#fff", textAlign: "center", fontWeight: "900", letterSpacing: 0.3 },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111",
        borderWidth: 1,
        borderColor: "#222",
    },
    searchField: { flex: 1, color: "#fff", borderWidth: 1, borderColor: "#222", padding: 10, borderRadius: 10 },
});

export default styles;
