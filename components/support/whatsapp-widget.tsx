"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801785872142";
const SOURCE_TAG = "[PetBazaar Website]";
const DEFAULT_MESSAGE = `${SOURCE_TAG} Hello! I have a question about PetBazaar.`;

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show widget after a short delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const openWhatsApp = (message?: string) => {
    const encodedMessage = encodeURIComponent(message || DEFAULT_MESSAGE);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
  };

  if (!isVisible) return null;

  return (
    <div className='fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6'>
      {isOpen && (
        <div className='absolute bottom-16 right-0 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300'>
          <div className='bg-green-500 p-4 text-white'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
                  <MessageCircle className='h-5 w-5' />
                </div>
                <div>
                  <p className='font-semibold'>PetBazaar Support</p>
                  <p className='text-xs text-white/80'>
                    Typically replies in minutes
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className='p-1 hover:bg-white/20 rounded-full transition-colors'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          </div>

          <div className='p-4 space-y-3'>
            <p className='text-sm text-gray-600'>
              Hi there! How can we help you today?
            </p>

            <div className='space-y-2'>
              <Button
                variant='outline'
                className='w-full justify-start text-sm h-auto py-2 px-3'
                onClick={() =>
                  openWhatsApp(`${SOURCE_TAG} I have a question about a product`)
                }
              >
                Product Inquiry
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start text-sm h-auto py-2 px-3'
                onClick={() => openWhatsApp(`${SOURCE_TAG} I need help with my order`)}
              >
                Order Support
              </Button>
              <Button
                variant='outline'
                className='w-full justify-start text-sm h-auto py-2 px-3'
                onClick={() => openWhatsApp(`${SOURCE_TAG} I have a general question`)}
              >
                General Question
              </Button>
            </div>

            <Button
              className='w-full bg-green-500 hover:bg-green-600 text-white'
              onClick={() => openWhatsApp()}
            >
              <MessageCircle className='h-4 w-4 mr-2' />
              Start Chat
            </Button>
          </div>
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className='h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300'
        size='icon'
      >
        {isOpen ? (
          <X className='h-6 w-6 text-white' />
        ) : (
          <MessageCircle className='h-6 w-6 text-white' />
        )}
      </Button>

      {!isOpen && (
        <span className='absolute -top-1 -right-1 flex h-3 w-3'>
          <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
          <span className='relative inline-flex rounded-full h-3 w-3 bg-green-500'></span>
        </span>
      )}
    </div>
  );
}
