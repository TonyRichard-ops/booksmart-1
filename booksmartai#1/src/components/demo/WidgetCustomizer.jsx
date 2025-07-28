import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Palette, Settings, MessageSquare } from "lucide-react";

export default function WidgetCustomizer({ settings, onSettingsChange }) {
  const updateSetting = (key, value) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Primary Color</Label>
            <div className="flex items-center gap-3 mt-2">
              <div
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                style={{ backgroundColor: settings.primary_color }}
                onClick={() => document.getElementById('primary-color').click()}
              />
              <Input
                id="primary-color"
                type="color"
                value={settings.primary_color}
                onChange={(e) => updateSetting('primary_color', e.target.value)}
                className="w-16 h-8 p-0 border-none"
              />
              <Input
                value={settings.primary_color}
                onChange={(e) => updateSetting('primary_color', e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <Label>Accent Color</Label>
            <div className="flex items-center gap-3 mt-2">
              <div
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                style={{ backgroundColor: settings.accent_color }}
                onClick={() => document.getElementById('accent-color').click()}
              />
              <Input
                id="accent-color"
                type="color"
                value={settings.accent_color}
                onChange={(e) => updateSetting('accent_color', e.target.value)}
                className="w-16 h-8 p-0 border-none"
              />
              <Input
                value={settings.accent_color}
                onChange={(e) => updateSetting('accent_color', e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <Label>Widget Position</Label>
            <Select 
              value={settings.widget_position} 
              onValueChange={(value) => updateSetting('widget_position', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Messaging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Greeting Message</Label>
            <Textarea
              value={settings.greeting_message}
              onChange={(e) => updateSetting('greeting_message', e.target.value)}
              placeholder="Hi! I can help you book an appointment..."
              className="mt-2"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Services</p>
              <p className="text-sm text-slate-500">Display service options</p>
            </div>
            <Switch
              checked={settings.show_services}
              onCheckedChange={(value) => updateSetting('show_services', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Availability</p>
              <p className="text-sm text-slate-500">Display real-time slots</p>
            </div>
            <Switch
              checked={settings.show_availability}
              onCheckedChange={(value) => updateSetting('show_availability', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require Phone</p>
              <p className="text-sm text-slate-500">Collect phone numbers</p>
            </div>
            <Switch
              checked={settings.collect_phone}
              onCheckedChange={(value) => updateSetting('collect_phone', value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}