CREATE TABLE masep.questions (
	id bigint NOT NULL DEFAULT nextval('gs'::regclass),
	question varchar(500) NOT NULL ,
	answer varchar(255) NOT NULL,	
	image_url varchar(255) NULL,
	CONSTRAINT questions_pk PRIMARY KEY (id),
	CONSTRAINT questions_un UNIQUE (question)
);

ALTER TABLE masep.questions ADD option_a varchar(500) NOT NULL;
ALTER TABLE masep.questions ADD option_b varchar(500) NOT NULL;
ALTER TABLE masep.questions ADD option_c varchar(500) NOT NULL;
ALTER TABLE masep.questions ADD option_d varchar(500) NOT NULL;
ALTER TABLE masep.questions ADD option_e varchar(500) NOT NULL;
ALTER TABLE masep.questions ADD serial_number bigint NOT NULL;
ALTER TABLE masep.questions ADD CONSTRAINT questions_uni UNIQUE (serial_number);



CREATE TABLE masep.user_answers (
	id bigint NOT NULL DEFAULT nextval('gs'::regclass),
	email varchar(255) NULL,
	question_id bigint NOT NULL,
	answer varchar(500) NOT NULL DEFAULT false,
	is_correct boolean NOT NULL,
	CONSTRAINT user_answers_pk PRIMARY KEY (id),
	CONSTRAINT user_answers_fk FOREIGN KEY (id) REFERENCES masep.questions(id)
);

CREATE INDEX user_answers_is_correct_idx ON masep.user_answers (is_correct,answer,question_id,email);


CREATE TABLE masep.user_score (
	id bigint NOT NULL DEFAULT nextval('gs'::regclass),
	email varchar(255) NULL,
	score bigint NOT NULL,
	CONSTRAINT user_score_pk PRIMARY KEY (id)
);

CREATE INDEX user_score_email_idx ON masep.user_score (email);

CREATE TABLE masep.settings (
	id bigint NOT NULL DEFAULT nextval('gs'::regclass),
	"name" varchar(255) NOT NULL,
	value varchar(500) NOT NULL,
	CONSTRAINT settings_pk PRIMARY KEY (id)
);
CREATE INDEX settings_name_idx ON masep.settings ("name",value);
ALTER TABLE masep.settings ADD CONSTRAINT settings_un UNIQUE ("name");

alter table masep.user_answers drop constraint user_answers_fk;

INSERT INTO masep.settings
(id, "name", value)
VALUES(96, 'cutoff_mark', '3');
INSERT INTO masep.settings
(id, "name", value)
VALUES(133, 'admin_phone_number', '0112345678');
INSERT INTO masep.settings
(id, "name", value)
VALUES(95, 'admin_email', 'tobi.lasisi@gmail.com');
ALTER TABLE masep.user_score ADD pass boolean NOT NULL;
ALTER TABLE masep.user_score ADD cutoff_used bigint NOT NULL;

ALTER TABLE masep.user_score ADD date_taken timestamp(0) NOT NULL DEFAULT now();

ALTER TABLE masep.questions ADD archived boolean NOT NULL DEFAULT false;

ALTER TABLE masep.user_score ADD date_started timestamp NULL DEFAULT now();
