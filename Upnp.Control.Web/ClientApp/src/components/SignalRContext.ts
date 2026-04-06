import type { HubConnection } from "@microsoft/signalr";
import { createContext } from "react";

export const SignalRContext = createContext<HubConnection | null>(null)