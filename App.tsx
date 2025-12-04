import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatArea } from './components/ChatArea';
import { LayerWorkspace } from './components/LayerWorkspace';
import { ChatMessage, Layer, LayerType, MessageRole, GenerationState } from './types';
import { WELCOME_MESSAGE } from './constants';
import { generateBaseImage, generateLayer } from './services/geminiService';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: MessageRole.MODEL,
      text: WELCOME_MESSAGE,
      timestamp: Date.now()
    }
  ]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    currentTask: null
  });

  const addMessage = (role: MessageRole, text: string) => {
    setMessages(prev => [...prev, {
      id: uuidv4(),
      role,
      text,
      timestamp: Date.now()
    }]);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    addMessage(MessageRole.USER, text);
    setGenerationState({ isGenerating: true, currentTask: "Generating creative concept..." });

    try {
      // Step 1: Generate the base image
      const base64Data = await generateBaseImage(text);
      
      const newLayer: Layer = {
        id: uuidv4(),
        type: LayerType.ORIGINAL,
        base64Data,
        mimeType: 'image/png',
        promptUsed: text,
        createdAt: Date.now()
      };

      setLayers(prev => [newLayer, ...prev]);
      addMessage(MessageRole.MODEL, "I've generated the base creative based on your request. You can now split it into layers.");
    
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Sorry, I encountered an error generating the image.";
      
      if (error.message && error.message.includes("API Key")) {
        errorMessage += " It seems the API Key is missing. Please check your Vercel Environment Variables (TUZI_API_KEY).";
      } else {
        errorMessage += " Please try a different prompt or check the console.";
      }
      
      addMessage(MessageRole.SYSTEM, errorMessage);
    } finally {
      setGenerationState({ isGenerating: false, currentTask: null });
    }
  }, []);

  const handleSplitLayer = useCallback(async (originalLayerId: string) => {
    const originalLayer = layers.find(l => l.id === originalLayerId);
    if (!originalLayer) return;

    setGenerationState({ isGenerating: true, currentTask: "Splitting layers (Subject & Background)..." });
    addMessage(MessageRole.MODEL, "Splitting image into separate layers. This might take a moment...");

    try {
      // Execute both splits in parallel for speed
      // Note: In a production app, we might queue these to avoid rate limits, 
      // but strictly following instructions, we call genai per task.
      const [subjectBase64, backgroundBase64] = await Promise.all([
        generateLayer(originalLayer.base64Data, 'SUBJECT'),
        generateLayer(originalLayer.base64Data, 'BACKGROUND')
      ]);

      const subjectLayer: Layer = {
        id: uuidv4(),
        type: LayerType.SUBJECT,
        base64Data: subjectBase64,
        mimeType: 'image/png',
        promptUsed: 'Split Subject',
        createdAt: Date.now(),
        parentId: originalLayerId
      };

      const backgroundLayer: Layer = {
        id: uuidv4(),
        type: LayerType.BACKGROUND,
        base64Data: backgroundBase64,
        mimeType: 'image/png',
        promptUsed: 'Split Background',
        createdAt: Date.now(),
        parentId: originalLayerId
      };

      setLayers(prev => [subjectLayer, backgroundLayer, ...prev]);
      addMessage(MessageRole.MODEL, "Layers separated successfully! You can see the isolated subject and the clean background on the right.");

    } catch (error) {
      console.error(error);
      addMessage(MessageRole.SYSTEM, "Failed to split layers. The model might be busy or the image complexity is too high.");
    } finally {
      setGenerationState({ isGenerating: false, currentTask: null });
    }
  }, [layers]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-950 text-neutral-100 font-sans">
      {/* Sidebar / Chat */}
      <div className="w-96 min-w-[320px] h-full flex-shrink-0 z-20 shadow-2xl shadow-black">
        <ChatArea 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          generationState={generationState}
        />
      </div>

      {/* Main Content / Canvas */}
      <div className="flex-1 h-full relative z-10">
        <LayerWorkspace 
          layers={layers} 
          onSplitRequest={handleSplitLayer}
          isProcessing={generationState.isGenerating && generationState.currentTask?.includes("Split")}
        />
      </div>
    </div>
  );
}
