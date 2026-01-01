// Macro: Toggle Day/Night Clock
if (window.PhilsDayNightCycle) {
    window.PhilsDayNightCycle.toggle();
} else {
    ui.notifications.warn("Phil's Day/Night Cycle module is not loaded.");
}
