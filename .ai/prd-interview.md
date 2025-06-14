# Dokument wymagań produktu (PRD) - InterviewPrep AI

## 1. Przegląd produktu

InterviewPrep to minimalistyczna aplikacja webowa, która w ciągu 10 godzin ma zostać zbudowana przez osobę o ograniczonych umiejętnościach programowania. Umożliwia kandydatom samodzielne generowanie realistycznych pytań rekrutacyjnych na podstawie pełnej treści ogłoszenia o pracę oraz śledzenie postępów w ćwiczeniu odpowiedzi. Projekt zakłada wykorzystanie usług AI (OpenRouter) i gotowych narzędzi developerskich, aby zmaksymalizować szybkość dostarczenia i uprościć utrzymanie.

## 2. Problem użytkownika

Kandydaci nie wiedzą, jakich pytań oczekiwać na rozmowie kwalifikacyjnej. Ręczne wyszukiwanie i przygotowanie realistycznego zestawu pytań jest czasochłonne i stresujące. Brakuje prostego narzędzia, które pozwalałoby szybko wygenerować i przećwiczyć pytania odpowiadające konkretnemu ogłoszeniu o pracę.

## 3. Wymagania funkcjonalne

1. FR‑001 GitHub OAuth – użytkownik loguje się wyłącznie poprzez konto GitHub.
2. FR‑002 Formularz tekstowy – użytkownik wkleja pełną treść ogłoszenia o pracę.
3. FR‑003 Generowanie pytań – system wykrywa język ogłoszenia i zwraca 5 pytań rekrutacyjnych w tym samym języku, wykorzystując OpenRouter API z wybranymi modelami AI.
4. FR‑004 Przechowywanie – wszystkie wygenerowane pytania są zapisywane w bazie PostgreSQL (Supabase).
5. FR‑005 CRUD statusu – użytkownik może oznaczyć każde pytanie jako przećwiczone lub nieprzećwiczone.
6. FR‑006 Lista pytań – aplikacja wyświetla tabelę „Moje pytania" filtrowaną per zalogowany użytkownik.
7. FR‑007 Test e2e – pojedynczy test Playwright obejmuje logowanie, generowanie pytań i zmianę statusu.
8. FR‑008 CI/CD – GitHub Actions uruchamia test i build przy każdym pushu; merge blokowany przy nieudanym pipeline.
9. FR‑009 Obsługa błędów – przy braku klucza OpenRouter lub błędzie API system wyświetla komunikat i nie zapisuje pustych rekordów.

## 4. Granice produktu

● W zakresie MVP:
– Generowanie pytań, prosta lista pytań, status ✅/❌, autoryzacja GitHub, 1 test e2e, CI/CD.
● Poza zakresem MVP:
– Ocena odpowiedzi, import CV, chat/voice, zaawansowane statystyki, aplikacje mobilne, integracje z LinkedIn/kalendarzem, obsługa >3 użytkowników, dostępność WCAG.

## 5. Historyjki użytkowników

| ID     | Tytuł                    | Opis                                                                                                                                                     | Kryteria akceptacji                                                                                                                                                            |
| ------ | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| US‑001 | Logowanie przez GitHub   | Jako kandydat chcę zalogować się przez GitHub, aby korzystać z aplikacji bez tworzenia nowego hasła.                                                     | • Na stronie głównej widzę przycisk "Zaloguj z GitHub". • Po autoryzacji wracam do aplikacji w stanie zalogowanym. • Niezalogowany użytkownik nie może wyświetlić listy pytań. |
| US‑002 | Generowanie pytań        | Jako kandydat chcę wkleić treść ogłoszenia i otrzymać 5 pytań w tym samym języku, aby przygotować się do rozmowy.                                        | • Po wklejeniu ogłoszenia i kliknięciu "Generuj" otrzymuję dokładnie 5 pytań. • Pytania są w języku ogłoszenia. • Pytania zapisują się w bazie i pojawiają na liście.          |
| US‑003 | Przegląd listy pytań     | Jako kandydat chcę widzieć wszystkie wygenerowane pytania, aby śledzić, które już przećwiczyłem.                                                         | • Po zalogowaniu widzę tabelę "Moje pytania". • Każdy wiersz zawiera treść pytania i status ✅/❌.                                                                               |
| US‑004 | Oznaczanie przećwiczone | Jako kandydat chcę oznaczać pytania jako przećwiczone lub nie, aby kontrolować postęp.                                                                   | • Przy każdym pytaniu jest przycisk lub checkbox. • Kliknięcie zmienia status i zapisuje go w bazie.                                                                           |
| US‑005 | Obsługa braku klucza API | Jako użytkownik chcę zobaczyć przyjazny komunikat, jeśli system nie może wygenerować pytań z powodu błędnej konfiguracji, aby wiedzieć, co zrobić dalej. | • Jeśli klucz OpenRouter nie jest zdefiniowany powinienem dostać odpowiedź zamockowaną, jeśli API zwraca błąd 401/429, na ekranie pojawia się komunikat o błędzie. • Aplikacja nie crashuje i pozwala wrócić do formularza.   |

## 6. Metryki sukcesu

1. Pipeline CI przechodzi na zielono przy każdym pushu.
2. Test e2e przechodzi w ≥ 95 % uruchomień.
3. Średni czas generowania 5 pytań < 15 s;
