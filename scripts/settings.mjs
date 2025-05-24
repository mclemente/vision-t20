/** @type {boolean} */
export let spectatorMode;

Hooks.once("init", () => {
    game.settings.register(
        "vision-t20",
        "spectatorMode",
        {
            name: "VISION5E.SETTINGS.spectatorMode.label",
            hint: "VISION5E.SETTINGS.spectatorMode.hint",
            scope: "world",
            config: true,
            type: new foundry.data.fields.BooleanField({ initial: true }),
            onChange: (value) => {
                spectatorMode = value;

                if (!canvas.ready) {
                    return;
                }

                for (const token of canvas.tokens.placeables) {
                    if (!token.vision === token._isVisionSource()) {
                        token.initializeVisionSource();
                    }
                }
            },
        },
    );

    spectatorMode = game.settings.get("vision-t20", "spectatorMode");
});

Hooks.once("ready", () => {
    let content = "";

    if (!game.settings.storage.get("world").some((setting) => setting.key === "vision-t20.spectatorMode")) {
        content += `
            <div class="form-group">
                <label>${game.i18n.localize("VISION5E.SETTINGS.spectatorMode.label")}</label>
                <div class="form-fields">
                    <input type="checkbox" name="spectatorMode" ${game.settings.get("vision-t20", "spectatorMode") ? "checked" : ""}>
                </div>
                <p class="hint">${game.i18n.localize("VISION5E.SETTINGS.spectatorMode.hint")}</p>
            </div>
        `;
    }

    if (!content) {
        return;
    }

    foundry.applications.api.DialogV2.prompt({
        window: {
            title: `${game.i18n.localize("SETTINGS.Title")}: Vision 5e`,
            icon: "fa-solid fa-gears",
        },
        position: {
            width: 520,
        },
        content,
        ok: {
            callback: async (event, button) => {
                const settings = new foundry.applications.ux.FormDataExtended(button.form).object;
                const promises = [];
                let requiresReload = false;

                for (const [key, value] of Object.entries(settings)) {
                    if (game.settings.settings.get(`vision-t20.${key}`).requiresReload) {
                        requiresReload ||= value !== game.settings.get("vision-t20", key);
                    }

                    promises.push(game.settings.set("vision-t20", key, value));
                }

                await Promise.all(promises);

                if (requiresReload) {
                    foundry.utils.debouncedReload();
                }
            },
        },
    });
});
