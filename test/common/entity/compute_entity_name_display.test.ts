import { describe, expect, it } from "vitest";
import {
  computeEntityNameDisplay,
  computeEntityNameList,
} from "../../../src/common/entity/compute_entity_name_display";
import type { HomeAssistant } from "../../../src/types";
import {
  mockArea,
  mockDevice,
  mockEntity,
  mockFloor,
  mockStateObj,
} from "./context/context-mock";

describe("computeEntityNameDisplay", () => {
  it("returns text when all items are text", () => {
    const stateObj = mockStateObj({ entity_id: "light.kitchen" });
    const hass = {
      entities: {},
      devices: {},
      areas: {},
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      [
        { type: "text", text: "Hello" },
        { type: "text", text: "World" },
      ],
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors
    );

    expect(result).toBe("Hello World");
  });

  it("uses custom separator for text items", () => {
    const stateObj = mockStateObj({ entity_id: "light.kitchen" });
    const hass = {
      entities: {},
      devices: {},
      areas: {},
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      [
        { type: "text", text: "Hello" },
        { type: "text", text: "World" },
      ],
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors,
      { separator: " - " }
    );

    expect(result).toBe("Hello - World");
  });

  it("returns entity name", () => {
    const stateObj = mockStateObj({ entity_id: "light.kitchen" });
    const hass = {
      entities: {
        "light.kitchen": mockEntity({
          entity_id: "light.kitchen",
          name: "Kitchen Light",
        }),
      },
      devices: {},
      areas: {},
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      { type: "entity" },
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors
    );

    expect(result).toBe("Kitchen Light");
  });

  it("replaces entity with device name when entity uses device name", () => {
    const stateObj = mockStateObj({ entity_id: "light.kitchen" });
    const hass = {
      entities: {
        "light.kitchen": mockEntity({
          entity_id: "light.kitchen",
          name: "Kitchen Device",
          device_id: "dev1",
        }),
      },
      devices: {
        dev1: mockDevice({
          id: "dev1",
          name: "Kitchen Device",
        }),
      },
      areas: {},
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      { type: "entity" },
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors
    );

    expect(result).toBe("Kitchen Device");
  });

  it("does not replace entity with device when device is already included", () => {
    const stateObj = mockStateObj({ entity_id: "light.kitchen" });
    const hass = {
      entities: {
        "light.kitchen": mockEntity({
          entity_id: "light.kitchen",
          name: "Kitchen Device",
          device_id: "dev1",
        }),
      },
      devices: {
        dev1: mockDevice({
          id: "dev1",
          name: "Kitchen Device",
        }),
      },
      areas: {},
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      [{ type: "entity" }, { type: "device" }],
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors
    );

    // Since entity name equals device name, entity returns undefined
    // So we only get the device name
    expect(result).toBe("Kitchen Device");
  });

  it("returns combined entity and area names", () => {
    const stateObj = mockStateObj({ entity_id: "light.kitchen" });
    const hass = {
      entities: {
        "light.kitchen": mockEntity({
          entity_id: "light.kitchen",
          name: "Ceiling Light",
          area_id: "kitchen",
        }),
      },
      devices: {},
      areas: {
        kitchen: mockArea({
          area_id: "kitchen",
          name: "Kitchen",
        }),
      },
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      [{ type: "area" }, { type: "entity" }],
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors
    );

    expect(result).toBe("Kitchen Ceiling Light");
  });

  it("returns combined device and area names", () => {
    const stateObj = mockStateObj({ entity_id: "light.kitchen" });
    const hass = {
      entities: {
        "light.kitchen": mockEntity({
          entity_id: "light.kitchen",
          name: "Light",
          device_id: "dev1",
        }),
      },
      devices: {
        dev1: mockDevice({
          id: "dev1",
          name: "Smart Light",
          area_id: "kitchen",
        }),
      },
      areas: {
        kitchen: mockArea({
          area_id: "kitchen",
          name: "Kitchen",
        }),
      },
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      [{ type: "area" }, { type: "device" }],
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors
    );

    expect(result).toBe("Kitchen Smart Light");
  });

  it("returns floor name", () => {
    const stateObj = mockStateObj({ entity_id: "light.kitchen" });
    const hass = {
      entities: {
        "light.kitchen": mockEntity({
          entity_id: "light.kitchen",
          name: "Light",
          area_id: "kitchen",
        }),
      },
      devices: {},
      areas: {
        kitchen: mockArea({
          area_id: "kitchen",
          name: "Kitchen",
          floor_id: "first",
        }),
      },
      floors: {
        first: mockFloor({
          floor_id: "first",
          name: "First Floor",
        }),
      },
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      { type: "floor" },
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors
    );

    expect(result).toBe("First Floor");
  });

  it("filters out undefined names when combining", () => {
    const stateObj = mockStateObj({ entity_id: "light.kitchen" });
    const hass = {
      entities: {
        "light.kitchen": mockEntity({
          entity_id: "light.kitchen",
          name: "Light",
        }),
      },
      devices: {},
      areas: {},
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      [{ type: "area" }, { type: "entity" }, { type: "floor" }],
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors
    );

    // Area and floor don't exist, so only entity name is included
    expect(result).toBe("Light");
  });

  it("returns integration name", () => {
    const stateObj = mockStateObj({ entity_id: "light.hue_bulb" });
    const localize = (key: string) => {
      if (key === "component.hue.title") {
        return "Philips Hue";
      }
      return key;
    };
    const hass = {
      entities: {
        "light.hue_bulb": mockEntity({
          entity_id: "light.hue_bulb",
          name: "Bedroom Light",
          platform: "hue",
        }),
      },
      devices: {},
      areas: {},
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      { type: "integration" },
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors,
      undefined,
      localize
    );

    expect(result).toBe("Philips Hue");
  });

  it("returns platform as integration name when no translation exists", () => {
    const stateObj = mockStateObj({ entity_id: "light.custom_bulb" });
    const localize = (_key: string) => "";
    const hass = {
      entities: {
        "light.custom_bulb": mockEntity({
          entity_id: "light.custom_bulb",
          name: "Custom Light",
          platform: "custom_integration",
        }),
      },
      devices: {},
      areas: {},
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      { type: "integration" },
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors,
      undefined,
      localize
    );

    expect(result).toBe("custom_integration");
  });

  it("returns empty string for integration when platform is missing", () => {
    const stateObj = mockStateObj({ entity_id: "light.no_platform" });
    const localize = (key: string) => key;
    const hass = {
      entities: {
        "light.no_platform": mockEntity({
          entity_id: "light.no_platform",
          name: "Light",
          // No platform specified
        }),
      },
      devices: {},
      areas: {},
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      { type: "integration" },
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors,
      undefined,
      localize
    );

    expect(result).toBe("");
  });

  it("combines integration with area and entity names", () => {
    const stateObj = mockStateObj({ entity_id: "light.hue_bulb" });
    const localize = (key: string) => {
      if (key === "component.hue.title") {
        return "Philips Hue";
      }
      return key;
    };
    const hass = {
      entities: {
        "light.hue_bulb": mockEntity({
          entity_id: "light.hue_bulb",
          name: "Bulb",
          platform: "hue",
          area_id: "bedroom",
        }),
      },
      devices: {},
      areas: {
        bedroom: mockArea({
          area_id: "bedroom",
          name: "Bedroom",
        }),
      },
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      [{ type: "integration" }, { type: "area" }, { type: "entity" }],
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors,
      undefined,
      localize
    );

    expect(result).toBe("Philips Hue Bedroom Bulb");
  });

  it("mixes text with entity types", () => {
    const stateObj = mockStateObj({ entity_id: "light.kitchen" });
    const hass = {
      entities: {
        "light.kitchen": mockEntity({
          entity_id: "light.kitchen",
          name: "Light",
          area_id: "kitchen",
        }),
      },
      devices: {},
      areas: {
        kitchen: mockArea({
          area_id: "kitchen",
          name: "Kitchen",
        }),
      },
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameDisplay(
      stateObj,
      [{ type: "area" }, { type: "text", text: "-" }, { type: "entity" }],
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors
    );

    expect(result).toBe("Kitchen - Light");
  });
});

describe("computeEntityNameList", () => {
  it("returns list of names for each item type", () => {
    const stateObj = mockStateObj({ entity_id: "light.kitchen" });
    const hass = {
      entities: {
        "light.kitchen": mockEntity({
          entity_id: "light.kitchen",
          name: "Light",
          device_id: "dev1",
          area_id: "kitchen",
        }),
      },
      devices: {
        dev1: mockDevice({
          id: "dev1",
          name: "Smart Device",
          area_id: "kitchen",
        }),
      },
      areas: {
        kitchen: mockArea({
          area_id: "kitchen",
          name: "Kitchen",
          floor_id: "first",
        }),
      },
      floors: {
        first: mockFloor({
          floor_id: "first",
          name: "First Floor",
        }),
      },
    } as unknown as HomeAssistant;

    const result = computeEntityNameList(
      stateObj,
      [
        { type: "floor" },
        { type: "area" },
        { type: "device" },
        { type: "entity" },
        { type: "text", text: "Custom" },
      ],
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors
    );

    expect(result).toEqual([
      "First Floor",
      "Kitchen",
      "Smart Device",
      "Light",
      "Custom",
    ]);
  });

  it("returns undefined for missing context items", () => {
    const stateObj = mockStateObj({ entity_id: "light.kitchen" });
    const hass = {
      entities: {
        "light.kitchen": mockEntity({
          entity_id: "light.kitchen",
          name: "Light",
        }),
      },
      devices: {},
      areas: {},
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameList(
      stateObj,
      [{ type: "device" }, { type: "area" }, { type: "floor" }],
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors
    );

    expect(result).toEqual([undefined, undefined, undefined]);
  });

  it("returns integration name in list", () => {
    const stateObj = mockStateObj({ entity_id: "light.hue_bulb" });
    const localize = (key: string) => {
      if (key === "component.hue.title") {
        return "Philips Hue";
      }
      return key;
    };
    const hass = {
      entities: {
        "light.hue_bulb": mockEntity({
          entity_id: "light.hue_bulb",
          name: "Bedroom Light",
          platform: "hue",
          area_id: "bedroom",
        }),
      },
      devices: {},
      areas: {
        bedroom: mockArea({
          area_id: "bedroom",
          name: "Bedroom",
        }),
      },
      floors: {},
    } as unknown as HomeAssistant;

    const result = computeEntityNameList(
      stateObj,
      [{ type: "integration" }, { type: "area" }, { type: "entity" }],
      hass.entities,
      hass.devices,
      hass.areas,
      hass.floors,
      localize
    );

    expect(result).toEqual(["Philips Hue", "Bedroom", "Bedroom Light"]);
  });
});
