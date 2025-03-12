'use client';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StreetButton } from "@/components/ui/street-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLobbyAction, joinLobbyAction } from "@/app/actions";

// Define types for our players
interface Player {
  id: string;
  display_name: string;
  is_host: boolean;
  is_ready: boolean;
}

export default function LobbyPage() {
    return (
        <div>
            <h1>Lobby</h1>
        </div>
    );
}
