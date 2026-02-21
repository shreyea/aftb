"use client";

import React, { createContext, useContext } from "react";
import { defaultSiteConfig, type SiteConfig } from "@/site.config";

const ConfigContext = createContext<SiteConfig>(defaultSiteConfig);

export function ConfigProvider({
    config,
    children,
}: {
    config: SiteConfig;
    children: React.ReactNode;
}) {
    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    return useContext(ConfigContext);
}
