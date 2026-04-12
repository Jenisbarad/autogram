--
-- PostgreSQL database dump
--

\restrict DIznG9NsEABZdJP6twU5w5ZQttdAomoRQbfORayziNSGjIh7vqkDnU2hZ64WWFk

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: instagram_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.instagram_accounts (id, page_name, username, slug, category, instagram_user_id, access_token, app_id, app_secret, posting_mode, auto_viral_threshold, watermark_text, is_active, created_at, updated_at, allowed_submitters) FROM stdin;
1	Nature Page	naturepage	nature-page	nature					manual	0.7000	@naturepage	t	2026-03-11 11:31:20.065881+05:30	2026-03-11 11:31:20.065881+05:30	[]
2	cricketpulse1111	cricketpulse1111	cricketpulse1111	cricket	17841442673804407	EAASrCSjE6GEBQ4jdQsgd2B76JOTj8o8ZClhB6rQcD7muXyh1fidjgh518hYKLTQAkJV3WvLoIhZBZBexSAMKV2HEORiPBQKyHvJ09bfmZADBlUuEkqgALHtLZBZChqR2DWZBjo4bW8mFM6IOyZA4frofsWKAYUgp2J9RsUBEuH0SQ06NBgMBxsKvXhZBZCZAvQA9Iz5	947831814486600	feaa0fbd8ad725889bf558675c8733aa	manual	0.7000	@cricketpulse1111	t	2026-03-11 12:30:51.027884+05:30	2026-04-12 03:34:08.589333+05:30	\N
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.posts (id, account_id, category, media_url, raw_media_url, thumbnail_url, caption, hashtags, resolution, width, height, duration, source, source_url, file_hash, viral_score, likes_count, comments_count, views_count, shares_count, engagement_rate, status, instagram_media_id, published_at, error_message, created_at, updated_at) FROM stdin;
4	2	cricket	http://localhost:4000/media/processed/3385aa6f-f47c-4e07-8ba9-9ec60a1e5d7d_processed.mp4	https://videos.pexels.com/video-files/35145106/14888151_2160_3840_30fps.mp4	http://localhost:4000/media/thumbnails/3385aa6f-f47c-4e07-8ba9-9ec60a1e5d7d_thumb.jpg	Can you smell the thrill of the cricket pitch?\nThe sound of the bat, the rush of the ball, it's a game like no other. Cricket is a sport that brings people together 🏏\nFollow @cricketpulse1111 for more!	#cricketlove #cricketlife #cricketfans #cricketers #cricketworld #cricketaddict #cricketfever #cricketmania #cricketpassion #cricketenthusiast #cricketforever #cricketislife #cricketnation #cricketfansunite #cricketlovers #cricketsport #cricketplayer	2160x3840	2160	3840	20.67	pexels	https://videos.pexels.com/video-files/35145106/14888151_2160_3840_30fps.mp4	\N	0.8000	0	0	0	0	0.0000	rejected	\N	\N	\N	2026-03-11 12:32:46.243499+05:30	2026-03-12 15:22:39.661774+05:30
42	2	cricket	https://tripodic-loni-trimodal.ngrok-free.dev/media/processed/f98b8db6-36ec-4b14-b499-0513655acde0.mp4	\N	\N	Can you handle the suspense of a last-ball thriller? The roar of the crowd, the thrill of the game, it's what makes cricket so unforgettable! The skill, the strategy, the passion - it all comes together in this beautiful game 🏏\nFollow @undefined for more!	#CricketFans #CricketLovers #CricketIsLife #CricketNation #CricketAddict #TheGentlemansGame #CricketFever #InternationalCricket #CricketWorld #CricketNews #CricketUpdates #CricketHighlights #CricketReels #CricketVideos #CricketLove #CricketPassion #CricketForever	\N	\N	\N	\N	instagram_submission	https://www.instagram.com/reel/DSlz_WXCVIs/?igsh=b2hoYWgycHVhZ2Ru	\N	0.0000	0	0	0	0	0.0000	published	17884314756466322	2026-03-12 15:44:30.796516+05:30	\N	2026-03-12 15:44:30.796516+05:30	2026-03-12 15:44:30.796516+05:30
40	2	cricket	http://localhost:4000/media/processed/3fef2e20-5e1d-4242-9e7f-b25bbbdf39e9_processed.mp4	https://www.youtube.com/shorts/9vUg2c8roKs	http://localhost:4000/media/thumbnails/3fef2e20-5e1d-4242-9e7f-b25bbbdf39e9_thumb.jpg	Can you believe what Kieron Pollard just did? \nHe hit six sixes in an over, leaving everyone stunned! \nThis is a moment that will be etched in cricket history forever 🤯\nFollow @cricketpulse1111 for more!	#Cricket #KieronPollard #SixSixes #CricketHistory #CricketFans #Sports #CricketLovers #CricketNation #T20Cricket #ODICricket #TestCricket #CricketWorld #InternationalCricket #CricketNews #CricketUpdates #CricketHighlights #CricketVideos	1080x1920	1080	1920	54.50	youtube	https://www.youtube.com/shorts/9vUg2c8roKs	cb81d00fe9c508e502f2d60ec88c9bb44c358672d6a7e45c3f4eedcb14ff3350	0.1500	500000	50000	5000000	10000	0.0000	published	18185072419369283	2026-03-12 16:02:29.933951+05:30	\N	2026-03-12 15:32:43.405365+05:30	2026-03-12 16:02:29.933951+05:30
39	2	cricket	http://localhost:4000/media/processed/eeb96183-984b-4b3c-b8be-ce2cd878970c_processed.mp4	https://www.youtube.com/shorts/f9XXrX6Weow	http://localhost:4000/media/thumbnails/eeb96183-984b-4b3c-b8be-ce2cd878970c_thumb.jpg	Are you tired of the same old issues plaguing the world of cricket? The India vs England series has exposed some major problems that need to be addressed. From biased umpiring to lack of consistency in player performance, it's time for a change 🏏\nFollow @cricketpulse1111 for more!	#IndVsEng #CricketProblems #IndiaVsEngland #CricketFans #CricketLovers #CricketNation #ICC #BCCI #ECB #CricketAnalysis #CricketDebate #CricketNews #CricketUpdates #CricketVideos #CricketReels #CricketShorts #CricketContent #CricketPulse	1080x1080	1080	1080	32.86	youtube	https://www.youtube.com/shorts/f9XXrX6Weow	9317a0af287af0f2d76051b7ceb523dc2d462883320efb1e55add6dd3e239c55	0.1500	500000	50000	5000000	10000	0.0000	processing	\N	\N	Timeout waiting for media processing	2026-03-12 15:32:18.808205+05:30	2026-03-19 01:03:32.704658+05:30
45	2	cricket	https://tripodic-loni-trimodal.ngrok-free.dev/media/processed/e1a548e9-d0e5-412e-a703-d57e336416c5_processed.mp4	https://www.instagram.com/reel/DWBaFDyk0aR/	\N	Can you guess who's going to win the upcoming tournament? The battle between bat and ball is about to get intense. Get ready for some thrilling cricket action 🏏\nFollow @cricketpulse1111 for more!	#CricketFans #CricketLovers #CricketTournament #CricketMatches #CricketNews #CricketUpdates #CricketWorld #CricketAddict #CricketFever #CricketMania #CricketLeague #CricketChampionship #ICC #BCCI #CricketIndia #CricketAustralia #CricketEngland	\N	\N	\N	\N	quick_submit	https://www.instagram.com/reel/DWBaFDyk0aR/	\N	0.0000	0	0	0	0	0.0000	published	17969019573048329	2026-04-12 04:02:35.359576+05:30	\N	2026-04-12 04:02:35.359576+05:30	2026-04-12 04:02:35.359576+05:30
38	2	cricket	http://localhost:4000/media/processed/ff9a1e77-9c46-4692-b316-806d131442b7_processed.mp4	https://www.youtube.com/shorts/eTGDDaK3kK0	http://localhost:4000/media/thumbnails/ff9a1e77-9c46-4692-b316-806d131442b7_thumb.jpg	Can cricket really be this intense? 🏏\nThis sport looks tough, the skills and physicality required are on another level. From batting to bowling, it's a true test of athleticism.\nFollow @cricketpulse1111 for more!	#cricketfans #cricketlove #cricketlife #cricketers #cricketworld #cricketaddict #cricketfever #cricketnation #icccricket #cricketnews #cricketupdates #crickethighlights #cricketvideos #cricketreels #cricketpulse #cricketenthusiast #cricketobsessed	576x1024	576	1024	19.74	youtube	https://www.youtube.com/shorts/eTGDDaK3kK0	56d26f2cc316346f31471e3acfa46a1a57b46c149bb5655f76ce03ed6b1dd051	0.1500	500000	50000	5000000	10000	0.0000	rejected	\N	\N	\N	2026-03-12 15:31:52.356965+05:30	2026-04-12 15:11:13.577698+05:30
7	2	cricket	http://localhost:4000/media/processed/a66819c3-7a60-4c7d-90e0-83d584d299dd_processed.mp4	https://videos.pexels.com/video-files/6774463/6774463-uhd_2160_3840_30fps.mp4	http://localhost:4000/media/thumbnails/a66819c3-7a60-4c7d-90e0-83d584d299dd_thumb.jpg	**Can you handle the suspense?** Watching a cricket match can be nerve-wracking, especially when it's a close game. The thrill of victory and the agony of defeat are all part of the experience 🏏. Follow @cricketpulse1111 for more!	#cricketfans #cricketlove #cricketlife #cricketaddict #cricketmania #cricketfever #ipl #icc #cricketworldcup #testcricket #odicc #t20cricket #cricketers #cricketnews #cricketupdates #cricketpulse #cricketforever #cricketenthusiast	2160x3840	2160	3840	9.15	pexels	https://videos.pexels.com/video-files/6774463/6774463-uhd_2160_3840_30fps.mp4	\N	0.5000	0	0	0	0	0.0000	published	17984302776008544	2026-03-11 19:16:02.449584+05:30	Meta Graph API Error (Create Container): Invalid OAuth access token - Cannot parse access token	2026-03-11 12:33:25.002931+05:30	2026-03-12 15:22:39.661774+05:30
5	2	cricket	http://localhost:4000/media/processed/0315ce6c-2c04-4cc6-94c1-d7b5cb046db4_processed.mp4	https://videos.pexels.com/video-files/36495845/15475646_1440_2560_60fps.mp4	http://localhost:4000/media/thumbnails/0315ce6c-2c04-4cc6-94c1-d7b5cb046db4_thumb.jpg	Can you smell the thrill of the cricket pitch? The crack of the bat, the rush of the ball, and the roar of the crowd - it's a game like no other! The excitement is palpable 🏏\nFollow @cricketpulse1111 for more!	#cricketfans #cricketlove #cricketlife #cricketfever #cricketers #cricketground #cricketmatch #cricketworld #cricketaddict #cricketenthusiast #cricketforever #cricketsport #cricketnews #cricketupdates #cricketpulse #cricketreels #cricketvideos #cricketmoments	1440x2560	1440	2560	20.75	pexels	https://videos.pexels.com/video-files/36495845/15475646_1440_2560_60fps.mp4	\N	0.6000	0	0	0	0	0.0000	published	17924420376090262	2026-03-12 12:11:17.091332+05:30	Meta API Container Error: Invalid OAuth access token - Cannot parse access token	2026-03-11 12:33:07.436397+05:30	2026-03-12 15:22:39.661774+05:30
1	2	cricket	http://localhost:4000/media/processed/448ffdee-54c4-47ff-889b-6d37dc34968a_processed.mp4	https://videos.pexels.com/video-files/35550707/15061636_1080_1920_60fps.mp4	http://localhost:4000/media/thumbnails/448ffdee-54c4-47ff-889b-6d37dc34968a_thumb.jpg	Cricket at its finest 🏏✨\nWho else got goosebumps watching this?\nFollow cricketpulse1111 for daily cricket highlights	#cricket #ipl #bcci #cricketlovers #cricketfans #cricketmatch #sixes #boundaries #cricketworld #t20 #testcricket #crickethighlights #viral #reels #trending #fyp #sports #cricketlife	1080x1920	1080	1920	5.71	pexels	https://videos.pexels.com/video-files/35550707/15061636_1080_1920_60fps.mp4	\N	0.3000	0	0	0	0	0.0000	published	17878157013513271	2026-03-12 12:25:26.737076+05:30	\N	2026-03-11 12:32:00.67572+05:30	2026-03-12 15:22:39.661774+05:30
2	2	cricket	http://localhost:4000/media/processed/5cc27731-ba33-4d65-9513-ec73e8748884_processed.mp4	https://videos.pexels.com/video-files/35550704/15061640_1080_1920_60fps.mp4	http://localhost:4000/media/thumbnails/5cc27731-ba33-4d65-9513-ec73e8748884_thumb.jpg	Can you smell the thrill of the pitch? The crack of the bat, the rush of the field, and the roar of the crowd - it's what makes cricket so electrifying! The game of skill, strategy, and passion 🏏\nFollow @cricketpulse1111 for more!	#CricketLove #CricketFever #CricketIsLife #CricketNation #ICC #BCC #CricketNews #CricketUpdates #CricketFans #TestCricket #ODICricket #T20Cricket #CricketWorldCup #CricketGround #CricketPitch #CricketBall #CricketBat #CricketMerchandise	1080x1920	1080	1920	6.97	pexels	https://videos.pexels.com/video-files/35550704/15061640_1080_1920_60fps.mp4	\N	0.3000	0	0	0	0	0.0000	published	18095767226052209	2026-03-12 13:15:01.59178+05:30	Request failed with status code 400	2026-03-11 12:32:09.571509+05:30	2026-03-12 15:22:39.661774+05:30
43	2	cricket	https://tripodic-loni-trimodal.ngrok-free.dev/media/processed/ff824890-763a-44f2-b1cd-a6413dba373e.mp4	\N	\N	Are you ready for the most epic cricket season ever? \nThe biggest teams are gearing up to take the field and battle it out for the top spot. Get ready for thrilling matches and unforgettable moments 🏏\nFollow @undefined for more!	#CricketFans #CricketLovers #CricketSeason #Cricket Matches #CricketNews #ICCCricket #CricketWorldCup #CricketLife #CricketAddict #CricketFever #TheCricketTimes #CricketUpdates #CricketHighlights #CricketVideos #CricketPhotos #CricketReels #CricketNiche	\N	\N	\N	\N	instagram_submission	https://www.instagram.com/reel/DVvQWvqidhj/?igsh=bmE0dGtkYTZpY2Zi	\N	0.0000	0	0	0	0	0.0000	published	18123462907604749	2026-03-12 15:59:49.498471+05:30	\N	2026-03-12 15:59:49.498471+05:30	2026-03-12 15:59:49.498471+05:30
46	2	cricket	https://tripodic-loni-trimodal.ngrok-free.dev/media/processed/89c65ec3-fdc6-4648-92fb-1bbe0b80beeb_processed.mp4	https://www.instagram.com/reel/DWqMQy4NoB1/	\N	Can you handle a 150km/h delivery? 🏏\nWatch as the world's fastest bowlers take the pitch by storm, leaving batsmen stunned and fans on the edge of their seats. The art of fast bowling is a thrill to behold.\nFollow @cricketpulse1111 for more!	#CricketFans #ICC #CricketWorldCup #T20 #TestCricket #ODI #BowlingMasterclass #FastBowling #CricketLovers #CricketNation #Sports #CricketAddict #WicketMaiden #Overthrow #CricketReels #CricketHighlights #CricketNews	\N	\N	\N	\N	quick_submit	https://www.instagram.com/reel/DWqMQy4NoB1/	\N	0.0000	0	0	0	0	0.0000	published	18048846842723364	2026-04-12 15:10:50.346327+05:30	\N	2026-04-12 15:10:50.346327+05:30	2026-04-12 15:10:50.346327+05:30
30	2	cricket	http://localhost:4000/media/processed/b76e79bc-40ec-44e0-8869-49f33f0739bd_processed.mp4	https://www.youtube.com/shorts/BuFnS8qVemA	http://localhost:4000/media/thumbnails/b76e79bc-40ec-44e0-8869-49f33f0739bd_thumb.jpg	Can Zaheer Khan pull off the impossible? \nHe attempts one of the most insane catch tries in cricket history, leaving fans speechless! \nMind-blowing reflexes on display 🏏\nFollow @cricketpulse1111 for more!	#cricket #cricketfans #catchtry #zaheerkhan #cricketsports #icc #ipl #cricketlover #cricketshorts #cricketaddict #cricketfever #cricketworld #cricketnews #cricketupdate #cricketlove #cricketnation #cricketlife	720x1280	720	1280	9.87	youtube	https://www.youtube.com/shorts/BuFnS8qVemA	fc58ae6543eea0a1e118e48cb6d442d97dc820dda55443393257698dee56d996	0.1500	500000	50000	5000000	10000	0.0000	published	18080570873346397	2026-03-12 15:28:57.964966+05:30	\N	2026-03-12 15:26:17.829749+05:30	2026-03-12 15:28:57.964966+05:30
44	2	cricket	http://localhost:4000/media/processed/7330b05d-31b2-4256-8ccf-d9e97c6020fc_processed.mp4	https://www.youtube.com/shorts/tt_l_-5_8WU	http://localhost:4000/media/thumbnails/7330b05d-31b2-4256-8ccf-d9e97c6020fc_thumb.jpg	**Can a former NASA engineer take down the GOAT of Cricket?** Mark Rober's innovative bowling machine is put to the test against the legendary skills of Sachin Tendulkar. The battle of technology vs talent is on! 🏏\nFollow @cricketpulse1111 for more!	#CricketFans #SachinTendulkar #MarkRober #CricketInnovation #GOATofCricket #CricketTechnology #BowlingMachine #CricketBattle #TendulkarFans #CricketLovers #CricketNation #CricketReels #SportsInnovation #CricketNews #CricketUpdates #CricketLegends #CricketEntertainment	1080x1920	1080	1920	48.76	youtube	https://www.youtube.com/shorts/tt_l_-5_8WU	b5095f5eed6e37f8f668eaaba1a04926bb668c901c47aef5910ea0583791ea49	0.1500	500000	50000	5000000	10000	0.0000	processing	\N	\N	\N	2026-03-13 09:53:08.87658+05:30	2026-03-19 00:28:11.043029+05:30
41	2	cricket	http://localhost:4000/media/processed/7eac351d-0d3c-46c4-9c68-edba10388141_processed.mp4	https://www.youtube.com/shorts/Ap9PXq7ZZh0	http://localhost:4000/media/thumbnails/7eac351d-0d3c-46c4-9c68-edba10388141_thumb.jpg	Can you handle the laughter? 🤣 We've got the 3 funniest moments in cricket that will leave you in stitches! From bizarre run-outs to hilarious celebrations, you won't want to miss this. \nFollow @cricketpulse1111 for more!	#Cricket #CricketFunnyMoments #CricketLovers #CricketFan #FunnyCricketMoments #CricketMatches #CricketHighlights #CricketReels #CricketVideos #CricketFans #CricketNation #CricketLove #CricketAddict #CricketWorld #CricketLife #CricketForever	1080x1920	1080	1920	59.93	youtube	https://www.youtube.com/shorts/Ap9PXq7ZZh0	35dc5ff739c12c40b944976bd97a7b147add0709042c7c092f9703bac565f522	0.1500	500000	50000	5000000	10000	0.0000	rejected	\N	\N	Timeout waiting for media processing	2026-03-12 15:33:22.356658+05:30	2026-04-12 15:11:11.768371+05:30
31	2	cricket	http://localhost:4000/media/processed/6adafad1-3b56-4bd8-b62b-b9254b62298a_processed.mp4	https://www.youtube.com/shorts/f9XXrX6Weow	http://localhost:4000/media/thumbnails/6adafad1-3b56-4bd8-b62b-b9254b62298a_thumb.jpg	What's killing the spirit of cricket? \nThe India vs England series has brought to light some major concerns that need to be addressed. From inconsistent umpiring to poor pitch conditions, it's time to expose the truth 🏏\nFollow @cricketpulse1111 for more!	#cricketproblems #indvseng #cricketexposed #cricketfans #cricketlovers #icc #cricketworld #cricketnews #indiancricket #englishcricket #cricketanalysis #cricketdebate #cricketcontroversy #sportsnews #cricketpulse #cricketaddict #cricketenthusiast #cricketpassion	640x640	640	640	32.85	youtube	https://www.youtube.com/shorts/f9XXrX6Weow	cafa50913a020bbc7e44328d4f5a9fdb0fce1b29ca01f629f2c6e0ed12e92106	0.1500	500000	50000	5000000	10000	0.0000	rejected	\N	\N	Timeout waiting for media processing	2026-03-12 15:27:34.327532+05:30	2026-04-12 15:11:15.926775+05:30
47	2	cricket	https://tripodic-loni-trimodal.ngrok-free.dev/media/processed/1e0781a2-7921-4a87-b318-1bdeec54cdd0_processed.mp4	https://www.instagram.com/reel/DVYbkvCESOI/	\N	Can you guess who's going to win the upcoming cricket tournament? The thrill and excitement are building up, with top teams ready to clash. The cricket world is on the edge of their seats 🏏\nFollow @cricketpulse1111 for more!	#cricketfans #cricketlovers #cricketworld #crickettournament #cricketnews #cricketupdates #cricketaddict #cricketpulse #cricketenthusiast #cricketfever #cricketsports #cricketmaniac #cricketpassion #cricketgame #cricketmatches #cricketteams #cricketplayers	\N	\N	\N	\N	quick_submit	https://www.instagram.com/reel/DVYbkvCESOI/	\N	0.0000	0	0	0	0	0.0000	published	18064213622355511	2026-04-12 15:51:25.932969+05:30	\N	2026-04-12 15:51:25.932969+05:30	2026-04-12 15:51:25.932969+05:30
8	2	cricket	http://localhost:4000/media/processed/342520fd-837e-46b5-a98c-4bf1fcd5e763_processed.mp4	https://videos.pexels.com/video-files/29108313/12575116_1080_1920_30fps.mp4	http://localhost:4000/media/thumbnails/342520fd-837e-46b5-a98c-4bf1fcd5e763_thumb.jpg	Can you smell the adrenaline of the cricket field? The crack of the bat, the rush of the ball, and the thrill of the catch - what's your favorite part of the game? The suspense is killing us! 🏏\nFollow @cricketpulse1111 for more!	#cricketlove #cricketfever #cricketaddict #cricketers #cricketfans #icc #cricketworldcup #testcricket #t20cricket #ipl #psl #bpl #cricketnews #cricketupdates #cricket highlights #cricketmemes #cricketrecords #cricketlegend #cricketlife	1080x1920	1080	1920	26.53	pexels	https://videos.pexels.com/video-files/29108313/12575116_1080_1920_30fps.mp4	\N	0.6000	0	0	0	0	0.0000	published	18380741752086741	2026-03-11 19:14:19.682376+05:30	Meta API Container Error: Invalid OAuth access token - Cannot parse access token	2026-03-11 12:33:45.671686+05:30	2026-03-12 15:22:39.661774+05:30
33	2	cricket	http://localhost:4000/media/processed/180abb8b-dbd9-42b4-83b4-d412f2430b62_processed.mp4	https://www.youtube.com/shorts/lnnT7mYjNJM	http://localhost:4000/media/thumbnails/180abb8b-dbd9-42b4-83b4-d412f2430b62_thumb.jpg	Kya aapne kabhi socha tha ki ek over mein puri career khatam ho sakti hai? \nKohli ka ek over jo unki career ko badal diya, dekhne layak hai. \nEk hi over mein kya kya ho sakta hai? 🏏\nFollow @cricketpulse1111 for more!	#IPL #Cricket #ShivilKaushik #ViratKohli #CricketFans #CricketLovers #IndianCricket #CricketIndia #CricketNews #CricketUpdates #CricketHighlights #CricketReels #CricketVideos #CricketShorts #CricketMemories #CricketLegends #CricketHistory	1080x1920	1080	1920	16.37	youtube	https://www.youtube.com/shorts/lnnT7mYjNJM	ffce7e32b4989c6f7d6aefc49c7ed414badce0c40b63334430ddf8531386a459	0.1500	500000	50000	5000000	10000	0.0000	published	17876174535538010	2026-03-12 15:30:11.257784+05:30	\N	2026-03-12 15:29:29.41921+05:30	2026-03-12 15:30:11.257784+05:30
34	2	cricket	http://localhost:4000/media/processed/70a2216e-b0bd-4b93-bf59-86cc822e8ac6_processed.mp4	https://www.youtube.com/shorts/kRn3BxRuf5w	http://localhost:4000/media/thumbnails/70a2216e-b0bd-4b93-bf59-86cc822e8ac6_thumb.jpg	What's going through a batsman's mind when they're on the verge of getting out? \nThe pressure is mounting and every ball counts in the U19 World Cup. The young guns are putting it all on the line 🏏\nFollow @cricketpulse1111 for more!	#U19WorldCup #Cricket #ICCU19 #CricketFans #CricketLove #CricketFever #Sports #T20 #ODI #TestCricket #CricketNews #CricketUpdates #CricketHighlights #CricketVideos #CricketReels #CricketPulse #CricketCommunity	608x1080	608	1080	13.77	youtube	https://www.youtube.com/shorts/kRn3BxRuf5w	b363caadd41c9c003b6871ec3a188d96b00b5b4aafd4d6b32094adb4b5c14430	0.1500	500000	50000	5000000	10000	0.0000	published	18088117093905767	2026-03-12 15:30:45.165+05:30	\N	2026-03-12 15:29:48.141087+05:30	2026-03-12 15:30:45.165+05:30
32	2	cricket	http://localhost:4000/media/processed/1e61f27b-ee53-4185-a78b-41b16bff2f97_processed.mp4	https://www.youtube.com/shorts/ScarZQuyaLM	http://localhost:4000/media/thumbnails/1e61f27b-ee53-4185-a78b-41b16bff2f97_thumb.jpg	Can Arshdeep Singh's bowling spell destruction on the pitch? \nArshdeep Singh is known for his exceptional bowling skills, and this stump break is a testament to his talent. He takes down the wicket with ease, leaving the batsman stunned! 🏏\nFollow @cricketpulse1111 for more!	#Cricket #ArshdeepSingh #Bowling #StumpBreak #WicketMaiden #CricketFans #IndianCricket #PaceBowling #FastBowling #CricketHighlights #Sports #CricketLovers #IPL #TeamIndia #BCCI #CricketNation #CricketAddict #BowlersLife	1080x1920	1080	1920	34.48	youtube	https://www.youtube.com/shorts/ScarZQuyaLM	fc3d08ec14244aebf293686a15289d0133584eb666dd05e2c4f9c422262c96d0	0.1500	500000	50000	5000000	10000	0.0000	published	18311028226260828	2026-03-12 15:31:24.530218+05:30	\N	2026-03-12 15:29:01.256844+05:30	2026-03-12 15:31:24.530218+05:30
36	2	cricket	http://localhost:4000/media/processed/a94efbf0-88f9-4909-9301-b64559a8fd78_processed.mp4	https://www.youtube.com/shorts/aAtogaTXBGk	http://localhost:4000/media/thumbnails/a94efbf0-88f9-4909-9301-b64559a8fd78_thumb.jpg	Can MS Dhoni still stump you in a blink of an eye? \nThe Thala's superhero speed behind the stumps is still unmatched, stumping in just 0.2 seconds! \nLightning-fast reflexes on display 🏏\nFollow @cricketpulse1111 for more!	#cricket #msdhoni #chennaisuperkings #csk #ipl #indiancricket #cricketfans #stumping #wicketkeeping #thala #dhonifans #cricketreels #shorts #cricketlover #cricketaddict #cricketnation #cricketfever	1080x1920	1080	1920	7.78	youtube	https://www.youtube.com/shorts/aAtogaTXBGk	0c31deba3ed13543a799d66f5e743df0f41dd60fe0fab033032357e3f60a0e43	0.1500	500000	50000	5000000	10000	0.0000	published	18129626755480112	2026-03-12 16:02:32.112226+05:30	\N	2026-03-12 15:30:40.792384+05:30	2026-03-12 16:02:32.112226+05:30
37	2	cricket	http://localhost:4000/media/processed/3f5790ea-9d35-4d28-9e65-af62816da204_processed.mp4	https://www.youtube.com/shorts/Gzs-rqCuxTk	http://localhost:4000/media/thumbnails/3f5790ea-9d35-4d28-9e65-af62816da204_thumb.jpg	Can you ever get tired of Ian Smith's voice? 🗣️\nThe man is a commentary legend, bringing matches to life with his iconic calls. His enthusiasm is simply infectious!\nFollow @cricketpulse1111 for more!	#CricketFans #IanSmith #CommentaryLegend #CricketLove #SportsCommentary #CricketMatches #IconicMoments #CricketShorts #CricketVideos #CricketHighlights #CricketNews #CricketUpdates #CricketLovers #Cricinfo #CricketFanatics #CricketAddicts	1080x1920	1080	1920	26.91	youtube	https://www.youtube.com/shorts/Gzs-rqCuxTk	e0f527e5811303f473751ea1ef5720e15a081b91b962cc103a5943656d4b4d48	0.1500	500000	50000	5000000	10000	0.0000	rejected	\N	\N	\N	2026-03-12 15:31:23.118595+05:30	2026-04-12 15:11:14.37029+05:30
35	2	cricket	http://localhost:4000/media/processed/d6e3df3e-5a74-45ea-b5e2-a7f841322ab3_processed.mp4	https://www.youtube.com/shorts/vEN56X6wqWA	http://localhost:4000/media/thumbnails/d6e3df3e-5a74-45ea-b5e2-a7f841322ab3_thumb.jpg	Can a cricket match get any more intense? \nCricket is not just a game, it's an emotion that can lead to some heated exchanges on the field. The thrill of the game is unmatched ✅ \nFollow @cricketpulse1111 for more!	#cricket #cricketfans #cricketlove #cricketfever #cricketaddict #crickethighlights #cricketnews #cricketupdates #ipl #icc #cricketworldcup #testcricket #t20cricket #odicc #cricketmemes #cricketpulse #cricketfanatics #cricketforever	1080x1440	1080	1440	18.23	youtube	https://www.youtube.com/shorts/vEN56X6wqWA	7619e575cba25b0e118f49054becd3efa84b2999e4a06909e2e798f08e993f60	0.1500	500000	50000	5000000	10000	0.0000	rejected	\N	\N	\N	2026-03-12 15:30:30.239468+05:30	2026-04-12 15:11:15.118255+05:30
\.


--
-- Data for Name: analytics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.analytics (id, account_id, post_id, likes, comments, views, shares, saves, reach, impressions, followers_gained, recorded_at) FROM stdin;
\.


--
-- Data for Name: crawled_urls; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crawled_urls (id, url, source, account_id, created_at) FROM stdin;
1	https://example.com/test	\N	\N	2026-03-17 18:15:45.374275+05:30
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, status, created_at) FROM stdin;
20067e87-827e-4a0e-bd52-e946bc3b69b4	admin@test.com	$2b$10$QcCPkvBIsIRUL2H.vGO0..NOXdX03dpR36bz/Jzb8NXJHi9IoJ5SG	admin	approved	2026-03-19 00:23:13.856974+05:30
b82bab9c-f3aa-445d-8a3f-39442938c225	testmanual@example.com	$2b$10$rH2YJytx1jk1DJfW129PDefng7auW/20CJ0FmbRx12ENHyCVyk8Ay	user	approved	2026-03-19 00:30:51.571182+05:30
04a3f531-d7d8-4f5b-b690-6c6c85bf4b4f	Admin12@gmail.com	$2b$10$zk/cMKWSDh7uH5Xoy8MBoOF3Rhyo8P8k8HJaohgnQ1H7lA3rzs9f2	admin	approved	2026-03-20 01:10:04.206181+05:30
f5ec466a-23c1-4222-b587-a048af32d11e	sneha12@gmail.com	$2b$10$PzZDyDb0.vK.Jj6dYm4s3uZz3rCm3LS4BTI/e3SCkUBTF170av3yK	user	approved	2026-03-20 01:06:28.793034+05:30
5b8c4c2a-3725-491f-ba97-7cf8cb29681c	sneha@gmail.com	$2b$10$47SREMRTFS/2nEYw.jDBHurG6UzQpjWWTr0ZvdvKXPYENMBfO.XCa	user	approved	2026-03-20 01:03:31.49003+05:30
5eb26567-1c26-4f5e-8483-97ae5812f566	jenis12@gmail.com	$2b$10$6b8..Y/b6w.Ei7SG1kopJu2IxEOxcR/f3afjH36Z2ZkF7U.a8cYoC	user	approved	2026-03-20 01:01:43.717533+05:30
c23a46af-13d5-4bbc-bf76-2d4369fdb438	testinvite@example.com	$2b$10$z1liGOqG0P.Qws.dtpEGaetIYUQ/p.IYuHrhJmLUrpl8VZhykdBKC	user	approved	2026-03-19 00:30:52.273103+05:30
19be604b-b0e6-4e7b-a43f-da9cee3bcbd7	testuser_manual@example.com	$2b$10$p.S53ya9.NSbzWLujlSGvO9rRzSpzJJeWLQYWrevlyJvbBvouiuG.	user	approved	2026-03-19 00:24:21.374736+05:30
ad3f43b8-cb4e-4319-8496-78a771e3983d	test639099963311140393@example.com	$2b$10$xxxVfNkmBuyyFXl8pTAIt.Q8shDI9oGxyvaueY.cSyrMXa8qGcVO.	user	pending	2026-03-25 00:45:31.67706+05:30
\.


--
-- Data for Name: invite_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invite_codes (id, code, is_active, expires_at, created_by, created_at) FROM stdin;
31c4696d-70e7-4df3-8be0-db68a62e2db5	290AE9077D01833E	f	\N	20067e87-827e-4a0e-bd52-e946bc3b69b4	2026-03-19 00:30:52.064503+05:30
6773174d-5454-45b3-bf2d-99a3b6669cd8	284ED128EF65F905	t	\N	20067e87-827e-4a0e-bd52-e946bc3b69b4	2026-03-20 01:14:49.277179+05:30
\.


--
-- Data for Name: invite_usage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invite_usage (id, code_id, user_email, used_at) FROM stdin;
46013c6f-36ca-4798-b493-76b26056f413	31c4696d-70e7-4df3-8be0-db68a62e2db5	testinvite@example.com	2026-03-19 00:30:52.275642+05:30
b0384ade-8089-4e19-8708-8a5e3d44a979	31c4696d-70e7-4df3-8be0-db68a62e2db5	jenis12@gmail.com	2026-03-20 01:01:43.761866+05:30
1e015c02-4b28-41bf-989f-864003f2f401	31c4696d-70e7-4df3-8be0-db68a62e2db5	sneha@gmail.com	2026-03-20 01:03:31.523595+05:30
8f3959b6-d3e2-4f98-a3d6-be07c5388894	31c4696d-70e7-4df3-8be0-db68a62e2db5	sneha12@gmail.com	2026-03-20 01:06:28.827155+05:30
\.


--
-- Data for Name: job_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.job_logs (id, job_name, account_id, status, message, metadata, created_at) FROM stdin;
1	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-11 12:31:01.598645+05:30
2	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-11 12:31:47.41806+05:30
3	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-11 15:25:10.331145+05:30
4	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-11 16:21:08.029712+05:30
5	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 09:57:00.686059+05:30
6	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 11:18:42.292462+05:30
7	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 13:09:09.295623+05:30
8	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 13:13:07.13647+05:30
9	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 13:15:12.748925+05:30
10	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 13:16:05.365605+05:30
11	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 13:17:04.34963+05:30
12	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 13:27:58.817542+05:30
13	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 13:29:06.71332+05:30
14	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 14:16:19.624549+05:30
15	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 14:22:43.601205+05:30
16	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 15:00:25.62662+05:30
17	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 15:04:10.334247+05:30
18	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 15:25:37.542937+05:30
19	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 15:26:36.155526+05:30
20	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 15:29:19.653652+05:30
21	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 16:33:30.473723+05:30
22	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-12 16:48:39.022949+05:30
23	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-13 09:46:24.469223+05:30
24	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-13 09:48:55.923663+05:30
25	contentSearchJob	2	queued	Starting content discovery for category: cricket	\N	2026-03-19 00:26:02.049065+05:30
26	contentSearchJob	2	queued	Starting content discovery for category: cricket (Platform: instagram)	\N	2026-03-20 01:13:07.783235+05:30
27	contentSearchJob	2	queued	Starting content discovery for category: cricket (Platform: instagram)	\N	2026-03-20 01:32:02.569751+05:30
28	contentSearchJob	2	queued	Starting content discovery for category: cricket (Platform: youtube)	\N	2026-03-25 00:45:37.88643+05:30
29	quick_submit_failed	1	failed	Command failed: yt-dlp https://www.instagram.com/reel/test123/ -f bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best --merge-output-format mp4 --postprocessor-args ffmpeg:-c:v libx264 -c:a aac -movflags +faststart -o D:\\insta-autogram-antigravity\\backend\\media\\raw\\2670fe49-9f80-4c21-a9ca-1dde79288cf3.mp4 --no-playlist --socket-timeout 30 --retries 3\nWARNING: [Instagram] test123: Instagram API is not granting access\nERROR: [Instagram] test123: Instagram sent an empty media response. Check if this post is accessible in your browser without being logged-in. If it is not, then use --cookies-from-browser or --cookies for the authentication. See  https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp  for how to manually pass cookies. Otherwise, if the post is accessible in browser without being logged-in, please report this issue on  https://github.com/yt-dlp/yt-dlp/issues?q= , filling out the appropriate issue template. Confirm you are on the latest version using  yt-dlp -U\n	\N	2026-04-12 02:25:56.751511+05:30
30	quick_submit_failed	2	failed	Video processing failed: ffmpeg exited with code 4294967274: Error opening output file D:\\insta-autogram-antigravity\\backend\\media\\processed\\aa584f80-dc2d-496c-bd75-700317084712_processed.mp4.\nError opening output files: Invalid argument\n	\N	2026-04-12 03:35:39.06404+05:30
31	quick_submit_failed	2	failed	Video processing failed: ffmpeg exited with code 4294967274: Error opening output file D:/insta-autogram-antigravity/backend/media/processed/baf79098-765a-4ded-8fe5-e5e4fff4493a_processed.mp4.\nError opening output files: Invalid argument\n	\N	2026-04-12 03:40:16.508084+05:30
32	quick_submit_failed	2	failed	Video processing failed: ffmpeg exited with code 4294967274: Error opening output file D:\\insta-autogram-antigravity\\backend\\media\\processed\\b0a1bee6-cb75-497d-b231-f3102f164904_processed.mp4.\nError opening output files: Invalid argument\n	\N	2026-04-12 03:42:38.573325+05:30
33	quick_submit_failed	2	failed	Video processing failed: ffmpeg exited with code 4294967274: Error opening output file D:\\insta-autogram-antigravity\\backend\\media\\processed\\22b06bce-6edb-41c5-a895-6ca99621a963_processed.mp4.\nError opening output files: Invalid argument\n	\N	2026-04-12 03:46:01.52002+05:30
34	quick_submit_failed	2	failed	Video processing failed: ffmpeg exited with code 4294967274: Error opening output file D:\\insta-autogram-antigravity\\backend\\media\\processed\\ab7974d7-ba6f-480b-80b2-b3574441ff84_processed.mp4.\nError opening output files: Invalid argument\n	\N	2026-04-12 03:47:40.347629+05:30
35	quick_submit_failed	2	failed	Video processing failed: ffmpeg exited with code 4294967274: Error opening output file D:\\insta-autogram-antigravity\\backend\\media\\processed\\f52f087b-48ff-44d1-8fa6-bc73a8ca21c1_processed.mp4.\nError opening output files: Invalid argument\n	\N	2026-04-12 03:51:08.446464+05:30
36	quick_submit_failed	2	failed	Video processing failed: ffmpeg exited with code 4294967274: Error opening output file D:\\insta-autogram-antigravity\\backend\\media\\processed\\307157ba-3f54-4246-a5a4-8bbb93e012b3_processed.mp4.\nError opening output files: Invalid argument\n	\N	2026-04-12 03:52:59.343358+05:30
37	quick_submit_failed	2	failed	Video processing failed: ffmpeg exited with code 4294967274: Error opening output file D:\\insta-autogram-antigravity\\backend\\media\\processed\\8a2213c5-ed46-4c01-8790-6aeed28917b7_processed.mp4.\nError opening output files: Invalid argument\n	\N	2026-04-12 03:55:32.509436+05:30
38	quick_submit_failed	2	failed	Command failed: yt-dlp https://www.instagram.com/reel/C5uKqaPQMj_/ -f bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best --merge-output-format mp4 --postprocessor-args ffmpeg:-c:v libx264 -c:a aac -movflags +faststart -o D:\\insta-autogram-antigravity\\backend\\media\\raw\\350568a6-27a8-421a-a72e-c5735e27688f.mp4 --no-playlist --socket-timeout 30 --retries 3\nWARNING: [Instagram] C5uKqaPQMj_: Instagram API is not granting access\nERROR: [Instagram] C5uKqaPQMj_: Instagram sent an empty media response. Check if this post is accessible in your browser without being logged-in. If it is not, then use --cookies-from-browser or --cookies for the authentication. See  https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp  for how to manually pass cookies. Otherwise, if the post is accessible in browser without being logged-in, please report this issue on  https://github.com/yt-dlp/yt-dlp/issues?q= , filling out the appropriate issue template. Confirm you are on the latest version using  yt-dlp -U\n	\N	2026-04-12 14:55:34.468256+05:30
39	quick_submit_failed	2	failed	Command failed: yt-dlp https://www.instagram.com/reel/C5oKm2PMs5G/ -f bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best --merge-output-format mp4 --postprocessor-args ffmpeg:-c:v libx264 -c:a aac -movflags +faststart -o D:\\insta-autogram-antigravity\\backend\\media\\raw\\97d1c5cd-7052-4f42-9eb7-7af8066374fe.mp4 --no-playlist --socket-timeout 30 --retries 3\nWARNING: [Instagram] C5oKm2PMs5G: Instagram API is not granting access\nERROR: [Instagram] C5oKm2PMs5G: Instagram sent an empty media response. Check if this post is accessible in your browser without being logged-in. If it is not, then use --cookies-from-browser or --cookies for the authentication. See  https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp  for how to manually pass cookies. Otherwise, if the post is accessible in browser without being logged-in, please report this issue on  https://github.com/yt-dlp/yt-dlp/issues?q= , filling out the appropriate issue template. Confirm you are on the latest version using  yt-dlp -U\n	\N	2026-04-12 15:01:59.023129+05:30
40	contentSearchJob	2	queued	Starting content discovery for category: cricket (Platform: instagram)	\N	2026-04-12 15:11:01.816935+05:30
41	contentSearchJob	2	queued	Starting content discovery for category: cricket (Platform: instagram)	\N	2026-04-12 22:52:36.45478+05:30
42	contentSearchJob	2	queued	Starting content discovery for category: cricket (Platform: instagram)	\N	2026-04-12 22:57:09.519904+05:30
\.


--
-- Name: analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.analytics_id_seq', 1, false);


--
-- Name: crawled_urls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.crawled_urls_id_seq', 1, true);


--
-- Name: instagram_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.instagram_accounts_id_seq', 3, true);


--
-- Name: job_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.job_logs_id_seq', 42, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.posts_id_seq', 47, true);


--
-- PostgreSQL database dump complete
--

\unrestrict DIznG9NsEABZdJP6twU5w5ZQttdAomoRQbfORayziNSGjIh7vqkDnU2hZ64WWFk

