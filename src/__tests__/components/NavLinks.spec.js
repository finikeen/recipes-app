import { describe, it, expect, vi } from "vitest";
import { shallowMount, mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { useAuthStore } from "@/features/auth/store";
import NavLinks from "@/components/NavLinks.vue";

vi.mock("vue-router", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  RouterLink: {
    template: '<a><slot /></a>',
  },
}));

describe("NavLinks", () => {
  const createWrapper = (props = {}, isAuthenticated = false) => {
    return shallowMount(NavLinks, {
      props,
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              auth: { isAuthenticated },
            },
          }),
        ],
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    });
  };

  it("renders Browse and New Recipe links", () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("Browse");
    expect(wrapper.text()).toContain("New Recipe");
  });

  it("shows Sign In link when not authenticated", () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("Sign In");
  });

  it("emits link-clicked when Browse link is clicked", async () => {
    const wrapper = createWrapper();
    const links = wrapper.findAll("a");
    await links[0].trigger("click");
    expect(wrapper.emitted("link-clicked")).toBeTruthy();
  });

  it("emits link-clicked when New Recipe link is clicked", async () => {
    const wrapper = createWrapper();
    const links = wrapper.findAll("a");
    await links[1].trigger("click");
    expect(wrapper.emitted("link-clicked")).toBeTruthy();
  });

  it("applies horizontal orientation by default", () => {
    const wrapper = createWrapper();
    expect(wrapper.classes()).not.toContain("nav-links--vertical");
  });

  it("applies vertical orientation when prop is set", () => {
    const wrapper = createWrapper({ orientation: "vertical" });
    expect(wrapper.classes()).toContain("nav-links--vertical");
  });
});
