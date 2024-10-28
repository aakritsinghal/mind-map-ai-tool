# MetaMind

MetaMind acts as a "digital twin" — a personal assistant that learns about you while helping you understand yourself better. In today’s busy world, it’s hard to keep track of thoughts, tasks, and ideas. MetaMind is designed to organize your mind and act as an intuitive, AI-driven companion. Simply speak or type, and MetaMind will generate a structured, aesthetic representation of your thoughts.

While similar tools exist, MetaMind combines multiple functions in one place, making it a comprehensive platform for mind mapping, task management, and much more.

## Features

- **Mind Mapping:** Users can input thoughts via voice or text to generate a mind map. Topics and subtopics are organized clearly, with nodes connected based on OpenAI embeddings and similarity checks. MetaMind integrates seamlessly with your knowledge base.
- **Task Management:** Extracts action items from your thoughts, creating a personalized to-do list.
- **MindChat:** Users can interact with MetaMind to leverage insights from previous conversations and voice/photo inputs. Example questions include: "What do I have to show John at our meeting tonight?" or "What was the name of that guy I met at the airport?"
- **Image Analysis:** Upload images with text, which MetaMind converts into actionable data for your mind map or task list.

## Technology Stack

MetaMind is built using a mix of frontend and backend technologies:

- **Frontend:** T3 stack, hosted on Vercel.
- **Backend:** Django, containerized with Docker and deployed on Google Cloud Run.
- **Data Management:** Supabase with PostgreSQL for structured data storage, paired with Pinecone as a vector database for efficient memory retrieval.
- **Voice Processing:** Google Speech-to-Text API transcribes voice inputs, extracting topics and action items.
- **Image Processing:** Google’s OCR technology converts text from uploaded images, integrating with the mind map and task list creation process.
- **AI & Natural Language Processing:** GPT-4 by OpenAI powers key functions like identifying action items, topics, and subtopics, and enables dynamic interactions in the MindChat feature of the application.

## How We Built It

MetaMind’s backend is containerized with Docker and deployed on Google Cloud Run for scalability and streamlined performance. The frontend is hosted on Vercel, while data management relies on Supabase. Key development steps included:

1. **Voice Input:** Using Google’s Speech-to-Text API, we transcribe user voice inputs, extracting topics and action items.
2. **Image Processing:** Google’s OCR technology converts text in images, integrating with mind mapping and task management.
3. **Mind Map Structure:** GPT-4 organizes transcriptions into main topics, subtopics, and details, referencing prior data to prevent redundancy.
4. **Memory Connection:** OpenAI embeddings enable MetaMind to detect similar topics and seamlessly update the mind map.
5. **Deployment:** Hosted the backend on Google Cloud Run for efficient scaling, with the frontend on Vercel.

## Challenges We Ran Into

- **Integration:** Integrating T3.js and Django in a seamless pipeline from input to mind map creation, including Supabase’s Python client.
- **Deployment Complexities:** Hosting across multiple platforms introduced bugs and deployment delays.
- **User Experience:** Designing an intuitive UX/UI for multiple input types (text, voice, image) required thoughtful design and testing.
- **Google OAuth Authentication:** Setting up user login via Google OAuth presented testing and troubleshooting challenges.

## Accomplishments

- **Live Deployment:** MetaMind is live at https://aiatl-aga.vercel.app/.
- **Feature-Rich Output:** Successfully integrated complex functionalities, from voice input to image analysis.
- **Rapid Development:** Built and deployed within a hackathon timeframe, requiring quick iterations and collaboration.

## Lessons Learned

- **Rapid Prototyping:** Quick prototyping, deployment pipelines, and multi-modal AI application challenges.
- **Backend Scalability:** Importance of scalable backend support for multi-user applications.

## What's Next for MetaMind

- **Integration with Popular Tools:** Connect schedules, reminders, and to-dos with Google Calendar, Notion, email, and other task managers.
- **User Testing:** Gather feedback to refine features based on real-world usage.
- **Mobile App Version:** Develop a mobile version for on-the-go accessibility.
- **Personalization:** Allow users to customize how their digital twin organizes and interacts with data.
- **Social AI Interactions:** Introduce a social layer where users’ AIs interact and exchange knowledge, adding a personalized interaction layer.
- **Backend Scalability:** Enhance backend to support more users and data as MetaMind scales.

---

