"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Globe, Camera, Phone, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  const [isProfessional, setIsProfessional] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-muted py-20 text-center border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">اتصل بنا</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            نحن هنا للإجابة عن استفساراتكم وتقديم الدعم المناسب.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          
          {/* Contact Information & Socials */}
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">معلومات التواصل</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-lg shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">اتصل بنا</h3>
                    <p className="text-muted-foreground mt-1">+213 666 50 99 41 | +213 550 89 94 84</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-lg shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">راسلنا</h3>
                    <p className="text-muted-foreground mt-1">Royalinkdz@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-lg shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">زورونا</h3>
                    <p className="text-muted-foreground mt-1">Dubai El Eulma City 19001 Setif Algeria</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">تابعونا</h2>
              <p className="text-muted-foreground mb-6">كونوا أول من يطّلع على عروضنا ومستجداتنا، عبر حساباتنا الرسمية على إنستغرام وفيسبوك.</p>
              <div className="flex gap-4">
                <Button variant="outline" className="gap-2 h-12 px-6">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Royal Ink
                </Button>
                <Button variant="outline" className="gap-2 h-12 px-6">
                  <Camera className="w-5 h-5 text-pink-600" />
                  @royalink.dz
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-8 md:p-10 rounded-2xl shadow-sm border">
            <h2 className="text-2xl font-bold mb-8">أرسل لنا رسالة</h2>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="flex items-center space-x-2 space-x-reverse bg-muted/50 p-4 rounded-lg">
                <Checkbox 
                  id="professional" 
                  checked={isProfessional}
                  onCheckedChange={(c) => setIsProfessional(c as boolean)} 
                />
                <Label htmlFor="professional" className="text-base font-medium cursor-pointer">
                  عميل مهني؟
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">الاسم الكامل أو اسم الشركة</Label>
                <Input id="name" placeholder="أدخل الاسم..." className="h-12" />
              </div>

              {isProfessional && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                  <Label htmlFor="rc">رقم السجل التجاري <span className="text-destructive">*</span></Label>
                  <Input id="rc" placeholder="أدخل رقم السجل التجاري..." className="h-12" required />
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" placeholder="example@domain.com" className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input id="phone" type="tel" placeholder="+213..." className="h-12" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">الموضوع (اختياري)</Label>
                <Input id="subject" placeholder="موضوع الرسالة..." className="h-12" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">الرسالة</Label>
                <Textarea id="message" placeholder="اكتب رسالتك هنا..." className="min-h-[150px] resize-y" />
              </div>

              <Button type="submit" className="w-full h-12 text-lg">
                إرسال الرسالة
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">الأسئلة الشائعة</h2>
          {/* @ts-expect-error - shadcn accordion types issue */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg text-right">هل تبيعون الطابعات إلى جانب الأحبار والمستلزمات؟</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                نعم. روايال إنك مورّد متكامل يغطي الطابعات بمختلف أنواعها وماركاتها، إضافة إلى خراطيش الحبر، التونر، الأحبار، الاسطوانات، الأشرطة، وقطع الغيار الأصلية، ضمن سقف واحد.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg text-right">في أي القطاعات تتخصصون؟</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                نقدّم حلولنا لكافة القطاعات الحيوية، بما في ذلك الشركات الكبرى، الإدارات الحكومية، المؤسسات التعليمية، المطاعم، والوكالات الإعلانية، إضافة إلى تلبية احتياجات الاستخدام المنزلي والشخصي.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg text-right">كم تستغرق مدة التوصيل عادة؟</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                نسعى دائماً لمعالجة الطلبات في أسرع وقت ممكن. يستغرق التوصيل داخل العاصمة وضواحيها حوالي 24 ساعة، بينما قد يستغرق التوصيل إلى باقي الولايات من يومين إلى 4 أيام عمل، حسب المنطقة.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg text-right">هل تقدّمون دعماً بعد إتمام عملية الشراء؟</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                بالتأكيد. التزامنا تجاهك لا ينتهي عند إتمام عملية الشراء، بل نقدّم دعماً فنياً متكاملاً لضمان عمل منتجاتنا بأفضل كفاءة، مع مساعدة فورية في حال واجهت أي استفسار أو مشكلة تقنية.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-lg text-right">هل يمكن لروايال إنك العمل مع الشركات الصغيرة؟</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                نعم، بكل تأكيد. ندرك أهمية الشركات الصغيرة والمتوسطة وندعم نموها من خلال حزم مرنة وأأسعار تنافسية تتناسب مع ميزانياتها وتلبي احتياجاتها بدقة.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-lg text-right">كيف أبدأ التعامل مع روايال إنك؟</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                الأمر في غاية البساطة! يمكنك تصفح منتجاتنا مباشرة عبر الموقع، أو التواصل معنا عبر صفحة "اتصل بنا"، أو عبر أرقام هواتفنا لطلب عرض سعر مخصص، وسيتولى فريقنا مساعدتك فوراً.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
