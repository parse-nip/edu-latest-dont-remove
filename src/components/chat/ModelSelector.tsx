'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Zap, Crown, Sparkles } from 'lucide-react';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: React.ReactNode;
  isFree: boolean;
  isFast: boolean;
}

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'x-ai/grok-beta',
    name: 'Grok 4 Fast',
    provider: 'xAI',
    description: 'Fast and free Grok model',
    icon: <Zap className="h-4 w-4" />,
    isFree: true,
    isFast: true,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'High-quality reasoning and coding',
    icon: <Brain className="h-4 w-4" />,
    isFree: false,
    isFast: false,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Latest GPT-4 model',
    icon: <Sparkles className="h-4 w-4" />,
    isFree: false,
    isFast: false,
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'Faster, cheaper GPT-4 variant',
    icon: <Zap className="h-4 w-4" />,
    isFree: false,
    isFast: true,
  },
  {
    id: 'google/gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: 'Google\'s advanced AI model',
    icon: <Crown className="h-4 w-4" />,
    isFree: false,
    isFast: false,
  },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, disabled = false }: ModelSelectorProps) {
  const selectedModelData = AVAILABLE_MODELS.find(model => model.id === selectedModel) || AVAILABLE_MODELS[0];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Model:</span>
      <Select value={selectedModel} onValueChange={onModelChange} disabled={disabled}>
        <SelectTrigger className="w-[200px] h-8">
          <div className="flex items-center gap-2">
            {selectedModelData.icon}
            <SelectValue placeholder="Select model" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center gap-2">
                {model.icon}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    {model.isFree && (
                      <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        Free
                      </span>
                    )}
                    {model.isFast && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                        Fast
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{model.description}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
