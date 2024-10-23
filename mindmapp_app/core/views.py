from google.cloud import speech
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AudioFile
from .serializers import AudioFileSerializer
import openai
from django.shortcuts import render
from django.core.cache import cache
from django.conf import settings

# Initialize Sentence-BERT model for similarity
model = SentenceTransformer('all-MiniLM-L6-v2')

# Set up your OpenAI API key
openai.api_key = settings.OPENAI_API_KEY

def mind_map_view(request):
    return render(request, 'core/mindmap.html')


class UploadTextView(APIView):  # Changed the view name to UploadTextView for testing with text
    def post(self, request, *args, **kwargs):
        # Get transcribed text from the POST request instead of handling audio for now
        transcribed_text = request.data.get('transcription')

        if not transcribed_text:
            return Response({"error": "No transcription provided."}, status=400)

        # Step 2: Use GPT-4 to segment the transcribed text into topics, subtopics, and info points
        structured_output = self.generate_topic_structure(transcribed_text)

        # Step 3: Parse the structured output from GPT-4
        segments = self.parse_gpt_output(structured_output)

        # Step 4: Use BERT to create embeddings for each segment and calculate similarities
        embeddings = self.generate_bert_embeddings(segments)

        # Step 5: Calculate additional relationships between segments using BERT embeddings
        mind_map = self.generate_mind_map_with_similarity(segments, embeddings)

        cache.set('latest_mind_map', mind_map, timeout=None)

        return Response(mind_map)

    # Use GPT-4 to segment the transcription
    def generate_topic_structure(self, transcription):
        prompt = f"""
        Break the following transcription down into main topics, subtopics, and detailed information points:
        {transcription}
        """

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Or "gpt-4"
            messages=[
                {"role": "system", "content": "You are tasked with analyzing a transcription and organizing it into a structured mind map."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )

        # Extract the structured output
        structured_output = response['choices'][0]['message']['content']

        # Log the output to inspect it
        print("GPT-4 Structured Output: ", structured_output)

        return structured_output

    # Parse the output from GPT-4 into segments (main topics, subtopics, info points)
    def parse_gpt_output(self, llm_output):
        segments = []
        lines = llm_output.splitlines()

        for line in lines:
            line = line.strip()

            # Collect main topics
            if line.startswith("Main Topic:"):
                main_topic = line.replace("Main Topic:", "").strip()
                segments.append(main_topic)

            # Collect subtopics
            elif line.startswith("- Subtopic:"):
                subtopic = line.replace("- Subtopic:", "").strip()
                segments.append(subtopic)

            # Collect detailed information points
            elif line.startswith("- Detailed Information:"):
                continue  # Skip this label since it's descriptive
            elif line.startswith("-"):
                info_point = line.replace("-", "").strip()
                segments.append(info_point)

        # Log to inspect the parsed segments
        print("Parsed Segments: ", segments)

        return segments

    # Use BERT to generate embeddings for each segment
    def generate_bert_embeddings(self, segments):
        if not segments or len(segments) == 0:
            raise ValueError("No segments to encode")
    
        embeddings = model.encode(segments)

        # Ensure the embeddings are reshaped correctly if necessary
        if embeddings.ndim == 1:
            embeddings = embeddings.reshape(1, -1)

        return embeddings

    # Generate the mind map by calculating similarity between segments using BERT
    def generate_mind_map_with_similarity(self, segments, embeddings):
        if len(embeddings) == 0 or embeddings.ndim == 1:
            raise ValueError("Embeddings array is either empty or 1D")

        # Now calculate cosine similarity
        similarity_matrix = cosine_similarity(embeddings)

        # Lower the threshold if needed (currently 0.7)
        threshold = 0.2
        connections = []
        num_segments = len(segments)

        # Log similarity values
        print("Similarity Matrix: ", similarity_matrix)

        for i in range(num_segments):
            for j in range(i + 1, num_segments):
                if similarity_matrix[i][j] > threshold:
                    connections.append({
                        "source": segments[i],
                        "target": segments[j],
                        "similarity": similarity_matrix[i][j]
                    })

        # Generate the final mind map with nodes and edges
        mind_map = {
            "nodes": [{"id": s, "label": s} for s in segments],
            "edges": [{"source": c["source"], "target": c["target"]} for c in connections]
        }

        print("Mind Map: ", mind_map)

        return mind_map
    
class MindMapView(APIView):
    def get(self, request, *args, **kwargs):
        mind_map = cache.get('latest_mind_map')
        if mind_map is None:
            return Response({"error": "No mind map available."}, status=404)
        return Response(mind_map)

# class UploadAudioView(APIView):
#     def post(self, request, *args, **kwargs):
#         serializer = AudioFileSerializer(data=request.data)
#         if serializer.is_valid():
#             audio_file = serializer.save()

#             # Step 1: Transcribe the uploaded audio
#             transcript = self.transcribe_audio(audio_file.file.path)
#             audio_file.transcription = transcript
#             audio_file.save()

#             # Step 2: Use GPT-4 to segment the transcript into topics, subtopics, and info points
#             structured_output = self.generate_topic_structure(transcript)

#             # Step 3: Parse the structured output from GPT-4
#             segments = self.parse_gpt_output(structured_output)

#             # Step 4: Use BERT to create embeddings for each segment and calculate similarities
#             embeddings = self.generate_bert_embeddings(segments)

#             # Step 5: Calculate additional relationships between segments using BERT embeddings
#             mind_map = self.generate_mind_map_with_similarity(segments, embeddings)

#             return Response(mind_map)
#         return Response(serializer.errors)

#     # Transcribe the audio using Google Cloud Speech-to-Text
#     def transcribe_audio(self, audio_file_path):
#         client = speech.SpeechClient()
#         with open(audio_file_path, "rb") as audio_file:
#             content = audio_file.read()

#         audio = speech.RecognitionAudio(content=content)
#         config = speech.RecognitionConfig(
#             encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
#             language_code="en-US"
#         )

#         response = client.recognize(config=config, audio=audio)
#         transcript = ""
#         for result in response.results:
#             transcript += result.alternatives[0].transcript + "\n"
#         return transcript

#     # Use GPT-4 to segment the transcription
#     def generate_topic_structure(self, transcription):
#         prompt = f"""
#         You are tasked with analyzing a transcription and organizing it into a structured mind map.
#         Break the transcription down into main topics, subtopics, and detailed information points.
#         Here is the transcription:
#         {transcription}
#         """

#         response = openai.Completion.create(
#             engine="gpt-3.5-turbo",
#             prompt=prompt,
#             max_tokens=1000,
#             temperature=0.7
#         )

#         return response.choices[0].text

#     # Parse the output from GPT-4 into segments (main topics, subtopics, info points)
#     def parse_gpt_output(self, llm_output):
#         segments = []
#         current_main_topic = None
#         current_subtopic = None

#         lines = llm_output.splitlines()
#         for line in lines:
#             line = line.strip()
#             if line.startswith("- Main Topic:"):
#                 current_main_topic = line.replace("- Main Topic:", "").strip()
#                 segments.append(current_main_topic)
#             elif line.startswith("- Subtopic:"):
#                 current_subtopic = line.replace("- Subtopic:", "").strip()
#                 segments.append(current_subtopic)
#             elif line.startswith("- Information point:"):
#                 info_point = line.replace("- Information point:", "").strip()
#                 segments.append(info_point)
#         return segments

#     # Use BERT to generate embeddings for each segment
#     def generate_bert_embeddings(self, segments):
#         embeddings = model.encode(segments)
#         return embeddings

#     # Generate the mind map by calculating similarity between segments using BERT
#     def generate_mind_map_with_similarity(self, segments, embeddings):
#         similarity_matrix = cosine_similarity(embeddings)

#         # Set a threshold for similarity connections
#         threshold = 0.7
#         connections = []
#         num_segments = len(segments)
#         for i in range(num_segments):
#             for j in range(i + 1, num_segments):
#                 if similarity_matrix[i][j] > threshold:
#                     connections.append({
#                         "source": segments[i],
#                         "target": segments[j],
#                         "similarity": similarity_matrix[i][j]
#                     })

#         # Generate the final mind map with nodes and edges
#         mind_map = {
#             "nodes": [{"id": s, "label": s} for s in segments],
#             "edges": [{"source": c["source"], "target": c["target"]} for c in connections]
#         }

#         return mind_map
