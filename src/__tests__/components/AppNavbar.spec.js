import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import AppNavbar from "@/components/AppNavbar.vue";

vi.mock("vue-router", () => ({
  useRoute: vi.fn(() => ({
    name: "home",
    path: "/",
  })),
  RouterLink: {
    template: '<a><slot /></a>',
  },
}));

describe("AppNavbar", () => {
  const createWrapper = () => {
    return shallowMount(AppNavbar, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              auth: { isAuthenticated: false },
            },
          }),
        ],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
          NavLinks: {
            template: '<div></div>',
            emits: ['link-clicked'],
          },
        },
      },
    });
  };

  it("renders navbar brand", () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("Recipe Forge");
  });

  it("hamburger button exists in the DOM", () => {
    const wrapper = createWrapper();
    expect(wrapper.find(".navbar__hamburger").exists()).toBe(true);
  });

  it("menu is hidden by default", () => {
    const wrapper = createWrapper();
    expect(wrapper.vm.menuOpen).toBe(false);
  });

  it("toggles menu when hamburger button is clicked", async () => {
    const wrapper = createWrapper();
    const hamburger = wrapper.find(".navbar__hamburger");
    await hamburger.trigger("click");
    expect(wrapper.vm.menuOpen).toBe(true);
    await hamburger.trigger("click");
    expect(wrapper.vm.menuOpen).toBe(false);
  });

  it("adds open class to hamburger when menu is open", async () => {
    const wrapper = createWrapper();
    expect(wrapper.find(".navbar__hamburger").classes()).not.toContain("navbar__hamburger--open");
    wrapper.vm.menuOpen = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".navbar__hamburger").classes()).toContain("navbar__hamburger--open");
  });

  it("closes menu when NavLinks emits link-clicked", async () => {
    const wrapper = createWrapper();
    wrapper.vm.menuOpen = true;
    await wrapper.vm.$nextTick();
    const navLinks = wrapper.findAllComponents({ name: "NavLinks" });
    if (navLinks.length > 0) {
      navLinks[0].vm.$emit("link-clicked");
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.menuOpen).toBe(false);
    }
  });

  it("closes menu when overlay is clicked", async () => {
    const wrapper = createWrapper();
    wrapper.vm.menuOpen = true;
    await wrapper.vm.$nextTick();
    const overlay = wrapper.find(".navbar__overlay");
    await overlay.trigger("click");
    expect(wrapper.vm.menuOpen).toBe(false);
  });

  it("closes menu when Escape key is pressed", async () => {
    const wrapper = createWrapper();
    wrapper.vm.menuOpen = true;
    await wrapper.vm.$nextTick();
    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(event);
    expect(wrapper.vm.menuOpen).toBe(false);
  });

  it("renders mobile menu when open", async () => {
    const wrapper = createWrapper();
    expect(wrapper.find(".navbar__mobile-menu").exists()).toBe(true);
  });

  it("renders overlay when menu is open", async () => {
    const wrapper = createWrapper();
    wrapper.vm.menuOpen = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".navbar__overlay").exists()).toBe(true);
  });
});
